import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Contact() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/contactemail')
      .then((response) => {
        if (!cancelled) setEmail(response.data.email ?? '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1>
          Con<span>tact</span>
        </h1>
        <p>
          What Audio is an infinite playlist: one ring of music, shared by the people who
          listen here. Scroll the ring, pick a card, and it keeps playing from there.
        </p>
        <p>
          Questions, takedowns or a track you think belongs on the ring:{' '}
          {email ? <a href={`mailto:${email}`}>{email}</a> : <span className="fine">…</span>}
        </p>
      </section>
    </main>
  );
}
