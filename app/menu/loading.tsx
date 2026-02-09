export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-ceylon-cream flex flex-col">
      {/* Navigation placeholder */}
      <div className="h-16 md:h-20" />

      <section className="flex-1 pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header skeleton */}
          <div className="mb-12 md:mb-16 text-center">
            <div className="h-10 md:h-14 bg-ceylon-orange/10 rounded-2xl w-3/4 mx-auto mb-4 animate-pulse" />
            <div className="h-5 bg-ceylon-orange/5 rounded-xl w-1/2 mx-auto animate-pulse" />
          </div>

          {/* Category skeleton */}
          <div className="space-y-12 md:space-y-16">
            {[1, 2].map((category) => (
              <div key={category}>
                {/* Category header skeleton */}
                <div className="h-12 w-48 bg-white rounded-2xl border-3 border-ceylon-orange/20 mb-6 md:mb-8 animate-pulse" />
                
                {/* Items grid skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="bg-white border-3 border-ceylon-text/5 shadow-md rounded-2xl md:rounded-3xl overflow-hidden"
                    >
                      {/* Image skeleton */}
                      <div className="w-full h-28 md:h-36 bg-ceylon-cream/50 animate-pulse" />
                      
                      {/* Content skeleton */}
                      <div className="p-3 md:p-4 space-y-2">
                        <div className="h-4 bg-ceylon-orange/10 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-ceylon-orange/5 rounded w-full animate-pulse" />
                        <div className="h-3 bg-ceylon-orange/5 rounded w-2/3 animate-pulse" />
                        <div className="flex items-center justify-between pt-2 border-t-2 border-ceylon-cream mt-2">
                          <div className="h-5 bg-ceylon-orange/10 rounded w-16 animate-pulse" />
                          <div className="h-8 w-8 bg-ceylon-orange/20 rounded-xl animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
