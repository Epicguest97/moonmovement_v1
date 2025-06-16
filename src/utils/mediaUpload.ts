export const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video' = 'image'): Promise<string> => {
  console.log(`Starting Cloudinary upload for ${resourceType}:`, file.name);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'moonmovement');
  
  try {
    console.log('Sending request to Cloudinary...');
    // Note the addition of resourceType in the URL
    const response = await fetch(`https://api.cloudinary.com/v1_1/deb30prxc/${resourceType}/upload`, { 
      method: 'POST',
      body: formData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary error response:', responseData);
      throw new Error(`Upload failed: ${responseData.error?.message || 'Unknown error'}`);
    }
    
    console.log(`Cloudinary ${resourceType} upload successful:`, responseData.secure_url);
    return responseData.secure_url;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    throw error;
  }
};