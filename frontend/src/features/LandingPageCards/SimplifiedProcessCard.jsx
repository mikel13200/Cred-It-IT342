import { CheckCircle } from "lucide-react";

const SimplifiedProcessCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Simplified Process
      </h3>
      <p className="text-gray-600 text-sm">
        Standardizes course comparison and accreditation between
        institutions
      </p>
    </div>
  );
};

export default SimplifiedProcessCard;
