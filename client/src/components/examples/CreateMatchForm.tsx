import { CreateMatchForm } from '../CreateMatchForm';

export default function CreateMatchFormExample() {
  return (
    <div className="p-4 min-h-screen bg-background">
      <CreateMatchForm
        onSubmit={(data) => {
          console.log('Form submitted with data:', data);
        }}
        onCancel={() => {
          console.log('Form cancelled');
        }}
        isLoading={false}
      />
    </div>
  );
}