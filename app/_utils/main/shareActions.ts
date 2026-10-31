import { Platform, Share } from 'react-native';
import {
  buildProductShareUrl,
  buildStoreShareUrl,
} from '@/app/_utils/main/shareLinks';

export async function shareProductLink(
  productId: string,
  productName?: string,
): Promise<void> {
  const url = buildProductShareUrl(productId);
  const title = productName?.trim() || 'Check this on Vhotis';
  const message = `${title}\n${url}`;

  await Share.share(
    Platform.OS === 'ios'
      ? { message: title, url, title }
      : { message, title },
  );
}

export async function shareStoreLink(
  slug: string,
  storeName?: string,
): Promise<void> {
  const url = buildStoreShareUrl(slug);
  const title = storeName?.trim()
    ? `Shop ${storeName} on Vhotis`
    : 'Shop on Vhotis';
  const message = `${title}\n${url}`;

  await Share.share(
    Platform.OS === 'ios'
      ? { message: title, url, title }
      : { message, title },
  );
}
