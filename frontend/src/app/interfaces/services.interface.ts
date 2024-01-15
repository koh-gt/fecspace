import { IconName } from '@fortawesome/fontawesome-common-types';

export type MenuItem = {
  title: string;
  i18n: string;
  faIcon: IconName;
  link: string;
};
export type MenuGroup = {
  title: string;
  i18n: string;
  items: MenuItem[];  
}
