import { Heading, Button, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = ({ countryCode }: { countryCode: string }) => {
  const isFrench = countryCode.toLowerCase() === "fr"

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden border-b border-gray-200">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <div className="space-y-6 max-w-3xl">
          <Heading
            level="h1"
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            {isFrench ? "Le ciel n'est plus" : "The sky is no longer"}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 ml-2">
              {isFrench ? "une limite" : "the limit"}
            </span>
          </Heading>

          <Text
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            {isFrench
              ? "Découvrez notre sélection exclusive de drones professionnels et loisirs. Achetez ou louez, c'est vous qui choisissez."
              : "Discover our exclusive selection of professional and recreational drones. Buy or rent, the choice is yours."}
          </Text>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <LocalizedClientLink href="/store" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              >
                {isFrench ? "Explorer le catalogue" : "Browse the catalog"}
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/categories/drones-loisirs" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                {isFrench ? "Voir les locations" : "See rentals"}
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
