import FileUploadComponent from './components/file-upload';
import ChatComponent from './components/chat';

export default function Home() {
  return (
    <div className="min-h-screen w-screen bg-black text-white flex">
      <div className="w-[30vw] min-h-screen p-6 flex justify-center items-center border-r border-white/10">
        <FileUploadComponent />
      </div>
      <div className="w-[70vw] min-h-screen p-6 border-l border-white/10 overflow-auto">
        <ChatComponent />
      </div>
    </div>
  );
}
