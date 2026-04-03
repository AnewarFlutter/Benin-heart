export interface EntityContactInfo {
  id: string;
  adresse: string;
  ville: string;
  pays: string;
  telephones: string[];
  emails: string[];
  horaires: string;
  urlSite: string;
}

export interface EntityContactInput {
  name: string;
  email: string;
  phone?: string;
  sujet: string;
  message: string;
}
