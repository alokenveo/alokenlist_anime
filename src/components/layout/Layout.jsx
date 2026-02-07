import Navbar from './Navbar'

export default function Layout({ children, onAnimeAdded }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onAnimeAdded={onAnimeAdded} />
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  )
}