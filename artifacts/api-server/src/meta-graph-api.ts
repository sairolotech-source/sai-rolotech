import { storage } from "./storage";

const META_GRAPH_BASE = "https://graph.facebook.com/v19.0";
const IG_CONTAINER_POLL_INTERVAL = 2000;
const IG_CONTAINER_MAX_POLLS = 15;

interface MetaPublishResult {
  facebookPostId?: string;
  facebookPostUrl?: string;
  instagramPostId?: string;
  instagramPostUrl?: string;
  socialMediaStatus: "published" | "partial" | "failed";
  socialMediaError?: string;
}

async function graphPost(endpoint: string, params: Record<string, string>): Promise<any> {
  const body = new URLSearchParams(params);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errMsg = data?.error?.message || response.statusText;
    throw new Error(errMsg);
  }
  return data;
}

async function graphGet(endpoint: string, params: Record<string, string>): Promise<any> {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url.toString());
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errMsg = data?.error?.message || response.statusText;
    throw new Error(errMsg);
  }
  return data;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function publishToFacebook(
  pageId: string,
  accessToken: string,
  message: string,
  imageUrl?: string | null
): Promise<{ id: string; url: string }> {
  const params: Record<string, string> = {
    message,
    access_token: accessToken,
  };

  let endpoint: string;
  if (imageUrl) {
    endpoint = `${META_GRAPH_BASE}/${pageId}/photos`;
    params.url = imageUrl;
  } else {
    endpoint = `${META_GRAPH_BASE}/${pageId}/feed`;
  }

  const data = await graphPost(endpoint, params);
  const postId = data.id || data.post_id;
  return {
    id: postId,
    url: `https://www.facebook.com/${postId}`,
  };
}

async function publishToInstagram(
  igAccountId: string,
  accessToken: string,
  caption: string,
  imageUrl: string
): Promise<{ id: string; url: string }> {
  const containerData = await graphPost(
    `${META_GRAPH_BASE}/${igAccountId}/media`,
    {
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }
  );

  const containerId = containerData.id;

  for (let i = 0; i < IG_CONTAINER_MAX_POLLS; i++) {
    await sleep(IG_CONTAINER_POLL_INTERVAL);
    const statusData = await graphGet(
      `${META_GRAPH_BASE}/${containerId}`,
      { fields: "status_code", access_token: accessToken }
    );

    if (statusData.status_code === "FINISHED") {
      break;
    } else if (statusData.status_code === "ERROR") {
      throw new Error(`Instagram container processing failed`);
    }
  }

  const publishData = await graphPost(
    `${META_GRAPH_BASE}/${igAccountId}/media_publish`,
    {
      creation_id: containerId,
      access_token: accessToken,
    }
  );

  const mediaId = publishData.id;

  let permalink = `https://www.instagram.com/`;
  try {
    const permalinkData = await graphGet(
      `${META_GRAPH_BASE}/${mediaId}`,
      { fields: "permalink", access_token: accessToken }
    );
    if (permalinkData.permalink) {
      permalink = permalinkData.permalink;
    }
  } catch {
    // fallback URL
  }

  return {
    id: mediaId,
    url: permalink,
  };
}

export async function publishToSocialMedia(
  broadcastId: string,
  title: string,
  message: string,
  imageUrl?: string | null
): Promise<MetaPublishResult> {
  const metaSettings = await storage.getMetaSettings();

  if (!metaSettings.metaAccessToken || !metaSettings.metaPageId) {
    const errorMsg = "Meta API not configured. Add your Page Access Token and Page ID in Admin Settings.";
    await storage.updateBroadcastPost(broadcastId, {
      socialMediaStatus: "failed",
      socialMediaError: errorMsg,
    });
    return {
      socialMediaStatus: "failed",
      socialMediaError: errorMsg,
    };
  }

  const fullMessage = `${title}\n\n${message}`;
  const errors: string[] = [];
  let facebookPostId: string | undefined;
  let facebookPostUrl: string | undefined;
  let instagramPostId: string | undefined;
  let instagramPostUrl: string | undefined;

  try {
    const fbResult = await publishToFacebook(
      metaSettings.metaPageId,
      metaSettings.metaAccessToken,
      fullMessage,
      imageUrl
    );
    facebookPostId = fbResult.id;
    facebookPostUrl = fbResult.url;
  } catch (err: any) {
    errors.push(`Facebook: ${err.message}`);
  }

  if (metaSettings.metaInstagramAccountId && imageUrl) {
    try {
      const igResult = await publishToInstagram(
        metaSettings.metaInstagramAccountId,
        metaSettings.metaAccessToken,
        fullMessage,
        imageUrl
      );
      instagramPostId = igResult.id;
      instagramPostUrl = igResult.url;
    } catch (err: any) {
      errors.push(`Instagram: ${err.message}`);
    }
  } else if (metaSettings.metaInstagramAccountId && !imageUrl) {
    errors.push("Instagram: Skipped (image required for Instagram posts)");
  }

  let socialMediaStatus: "published" | "partial" | "failed";
  if (facebookPostId || instagramPostId) {
    socialMediaStatus = errors.length > 0 ? "partial" : "published";
  } else {
    socialMediaStatus = "failed";
  }

  await storage.updateBroadcastPost(broadcastId, {
    facebookPostId: facebookPostId || null,
    facebookPostUrl: facebookPostUrl || null,
    instagramPostId: instagramPostId || null,
    instagramPostUrl: instagramPostUrl || null,
    socialMediaStatus,
    socialMediaError: errors.length > 0 ? errors.join("; ") : null,
  });

  return {
    facebookPostId,
    facebookPostUrl,
    instagramPostId,
    instagramPostUrl,
    socialMediaStatus,
    socialMediaError: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

export async function isMetaConfigured(): Promise<boolean> {
  const settings = await storage.getMetaSettings();
  return !!(settings.metaAccessToken && settings.metaPageId);
}
