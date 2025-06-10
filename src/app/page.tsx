import Layout3DViewer from '@/components/Layout3DViewer'

export default function Home() {
  return (
    <div className="w-full h-screen">
      <h1 className="absolute top-4 left-4 z-10 text-2xl font-bold text-white bg-black/50 px-4 py-2 rounded">
        3D Layout Viewer
      </h1>
      <Layout3DViewer />
    </div>
  );
}
