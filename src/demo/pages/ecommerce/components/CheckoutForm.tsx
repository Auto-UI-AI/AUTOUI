import React, { useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  address: string;
}

interface CheckoutFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userInfo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={userInfo.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={userInfo.email} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={userInfo.address} onChange={handleChange} required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CheckoutForm;
