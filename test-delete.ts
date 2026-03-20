const userId = "123e4567-e89b-12d3-a456-426614174000";
const imageUrl = "https://example.com/storage/v1/object/public/designs/123e4567-e89b-12d3-a456-426614174000/some-uuid.jpg";

if (imageUrl && imageUrl.includes('/storage/v1/object/public/designs/')) {
  try {
    const rawFilePath = imageUrl.split('/storage/v1/object/public/designs/')[1];
    if (rawFilePath) {
      const filePath = decodeURIComponent(rawFilePath);
      const pathParts = filePath.split('/');
      if (pathParts.length === 2 && pathParts[0] === userId && !pathParts[1].includes('..')) {
        console.log("Success! File path to delete:", filePath);
      } else {
        console.log("Blocked! filePath:", filePath, "userId:", userId);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
