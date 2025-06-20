
export interface ImageData {
  id: string;
  name: string;
  file: File;
  url: string;
  tags: string[];
  uploadDate: Date;
}

export interface ImageEditData {
  name: string;
  tags: string[];
}
