import {
  DemoImageUploader,
 SimplifiedProcessCard,
  EnhancedEfficiencyCard,
  SmartDecisionsCard,
  InfoApp,
  InfoCard,
  FooterCard,
  WelcomeCard,
  HeaderCard,
} from "../features/LandingPageCards/imports/LandingIndex";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <HeaderCard/>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <WelcomeCard/>
            <InfoCard/>
          </div>
          {/* Description */}
          <InfoApp/>
            {/* CTA Section */}
            <div className="mt-12">
              <DemoImageUploader />
            </div>
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 mt-5">
            <SimplifiedProcessCard/>
            <EnhancedEfficiencyCard/>
            <SmartDecisionsCard/>            
          </div>
          
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <FooterCard/>
      </footer>
    </div>
  );
}

export default LandingPage;
