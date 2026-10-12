export interface AuthModalDetail {
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export function openAuthModal(options?: AuthModalDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-signup-prompt", {
        detail: {
          title: options?.title || "Sign in or sign up to view the full gallery",
          description:
            options?.description ||
            "Create a free account or sign in to browse our complete collection of 35+ royal wedding, birthday, and special celebration stages in high definition.",
          redirectUrl: options?.redirectUrl || "/gallery",
        },
      })
    );
  }
}
