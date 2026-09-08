import ShareForm from './ShareForm.jsx';
import GenerateInvites from './GenerateInvites.jsx';

export default function AdminPanel() {
  return (
    <div className="adminPage">
      <ShareForm />
      <GenerateInvites />
    </div>
  );
}
