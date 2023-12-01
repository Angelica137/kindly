'use client';
import { useState } from 'react';

type AuthFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  buttonText: string;
  searchParams?: { message: string };
  isSignUp: boolean;
};

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  buttonText,
  searchParams,
  isSignUp,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailAgreed, setIsEmailAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailAgreed) {
      setErrorMessage('Please agree to share your email address.');
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setErrorMessage(null);
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  return (
    <form
      className=' flex-1 flex flex-col w-full items-center  justify-center gap-2 text-foreground'
      onSubmit={handleSubmit}
    >
      {' '}
      {isSignUp && (
        <>
          <label className='text-md' htmlFor='user_name'>
            Username
          </label>
          <input
            className='bg-white p-2 border border-primaryGreen rounded shadow mb-2'
            name='user_name'
            placeholder='Your Username'
            required
          />
          <label className='text-md' htmlFor='postcode'>
            Postcode
          </label>
          <input
            className='bg-white p-2 border border-primaryGreen  rounded shadow mb-2'
            name='postcode'
            placeholder='Insert only first half'
            required
          />
        </>
      )}
      <label className='text-md' htmlFor='email'>
        Email
      </label>
      <input
        className='bg-white p-2 border border-primaryGreen rounded shadow mb-2'
        name='email'
        placeholder='you@example.com'
        required
      />
      <label className='text-md' htmlFor='password'>
        Password
      </label>
      <input
        className='bg-white p-2 border border-primaryGreen rounded shadow mb-2'
        type='password'
        name='password'
        placeholder='••••••••'
        required
      />
      <div>
        <input
          type='checkbox'
          id='agreeCheckbox'
          checked={isEmailAgreed}
          onChange={() => setIsEmailAgreed(!isEmailAgreed)}
          required
        />
        <label htmlFor='agreeCheckbox' className='ml-2'>
          I agree to share my email address with the donors from this app.
        </label>
      </div>
      <button className='button button-rounded'>{buttonText}</button>
      {searchParams?.message && (
        <p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
          {searchParams.message}
        </p>
      )}
      {errorMessage && (
        <p className='text-red-500 text-sm mt-2'>{errorMessage}</p>
      )}
    </form>
  );
};

export default AuthForm;
