export const imageGenerationKeywords = [
  'generate an image',
  'create an image',
  'make an image',
  'draw',
  'generate a picture',
  'create a picture',
  'make a picture',
  'generate img',
  'create img',
  'make img',
  'generate photo',
  'create photo',
  'make photo',
  'imagine'
] as const;

export const isImageGenerationRequest = (content: string): boolean => {
  const normalizedContent = content.toLowerCase();
  const matchedKeywords = imageGenerationKeywords.filter(keyword => 
    normalizedContent.includes(keyword)
  );
  
  console.log('Checking for image generation request:', {
    content,
    normalizedContent,
    matchedKeywords,
    isRequest: matchedKeywords.length > 0
  });
  
  return matchedKeywords.length > 0;
};