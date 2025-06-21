
export interface ImageData {
  id: string;
  name: string;
  file: File;
  url: string;
  tags: string[];
  uploadDate: Date;
  fileSize?: number;
}

export interface ImageEditData {
  name: string;
  tags: string[];
}
