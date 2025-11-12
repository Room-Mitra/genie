export default function PublicLayout({ children }) {
  return (
    <>
      <div className="flex min-h-screen">
        <div className="w-full bg-gray-2 dark:bg-slate-950">
          <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
