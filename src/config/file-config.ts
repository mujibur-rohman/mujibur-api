/*
 * Config File Image Type
 */

export type ValidImageExtension = 'png' | 'jpg' | 'jpeg';
export type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

export const MAX_IMAGE_SIZE: number = 2; // Mega Byte

export const validImageExtension: ValidImageExtension[] = [
  'jpeg',
  'jpg',
  'png',
];
export const validMimeType: ValidMimeType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const AVATAR_PATH = '/img/avatar';
export const POST_PATH = '/img/post';
export const CONTENT_PATH = '/img/content';
