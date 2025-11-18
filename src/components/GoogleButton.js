// src/components/GoogleButton.jsx
import { useEffect, useRef } from 'react';
import { exchangeGoogleCredential } from '../lib/googleAuth';

export default function GoogleButton({ onSuccess, desiredRole = 'user', className = '' }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;

    /* 1) Init the client */
    window.google.accounts.id.initialize({
      client_id: "1055266214449-msoqaitva3dg8f3keahftr341601ngpf.apps.googleusercontent.com",
      callback: async (response) => {
        try {
          const user = await exchangeGoogleCredential(response.credential, desiredRole);
          onSuccess?.(user);
        } catch (e) {
          console.error(e);
          alert(e.message || 'Google sign-in failed');
        }
      },
      ux_mode: 'popup', // щоб не редіректило сторінку
    });

    /* 2) Render button */
    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with', // або 'signin_with'
      shape: 'rectangular',
      logo_alignment: 'left',
      // width: 300,
    });

    // (Optional) One Tap prompt:
    // window.google.accounts.id.prompt();
  }, []);

  return <div ref={btnRef} className={className} />;
}
