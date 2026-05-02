const fallbackImage = "/assets/images/landing-page/suit.jpg";

export const getSafeAdminOrderImageSrc = (imageURL?: string) => {
  if (!imageURL) {
    return fallbackImage;
  }

  if (imageURL.startsWith("/")) {
    return imageURL;
  }

  try {
    const url = new URL(imageURL);
    return url.hostname === "res.cloudinary.com" ? imageURL : fallbackImage;
  } catch {
    return fallbackImage;
  }
};
