import { Users } from "lucide-react";

const EnhancedEfficiencyCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Users className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Enhanced Efficiency
      </h3>
      <p className="text-gray-600 text-sm">
        Improves efficiency, transparency, and academic advising processes
      </p>
    </div>
  );
};

export default EnhancedEfficiencyCard;
