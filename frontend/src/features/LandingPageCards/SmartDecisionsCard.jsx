import { BookOpen } from "lucide-react";

const SmartDecisionsCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
        <BookOpen className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Smart Decisions
      </h3>
      <p className="text-gray-600 text-sm">
        Faster, smarter decisions for both students and educational institutions
      </p>
    </div>
  );
};

export default SmartDecisionsCard;
