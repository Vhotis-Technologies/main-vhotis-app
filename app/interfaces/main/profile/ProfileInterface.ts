export interface AccountHolderInterface {
  id?: string;
  name: string;
  email?: string;
  image?: string;
}

export default interface ProfileInterface {
  accountHolder: AccountHolderInterface;
  accounHolderData: {
    password: string;
    
  }
}
