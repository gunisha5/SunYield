import React, { useEffect, useState } from "react";
import { Zap, Info, X, HelpCircle, Lightbulb } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscriptionsAPI, earningsAPI, engagementAPI } from "../services/api";
import SharedNavigation from "../components/SharedNavigation";

const SolarCalculator: React.FC<{ isHomePage?: boolean }> = ({ isHomePage = false }) => {
  // 🔹 State hooks
  const [contributionAmount, setContributionAmount] = useState<number>(10000);
  const [operationYears, setOperationYears] = useState<number>(15);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [totalContribution, setTotalContribution] = useState<number>(0);
  const [reservedCapacity, setReservedCapacity] = useState<number>(0);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [co2Avoided, setCo2Avoided] = useState<number>(0);
  const [treesEquivalent, setTreesEquivalent] = useState<number>(0);
  const [totalOriginalContribution, setTotalOriginalContribution] = useState<number>(0);
  const [additionalContribution, setAdditionalContribution] = useState<number>(0);
  const [reinvestments, setReinvestments] = useState<any[]>([]);
  // 🔹 Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState<boolean>(false);
  const [infoContent, setInfoContent] = useState<{title: string, content: string}>({title: '', content: ''});
  // 🔹 Auth
  const { isAuthenticated } = useAuth();

  // 🔹 Default projects (Solar Capital style - flexible contribution)
  const defaultProjects = [
    { name: "Green Valley School", location: "Mumbai, Maharashtra", capacity: 100, minContribution: 999, efficiency: "High" },
    { name: "Sunrise Hospital", location: "Delhi, NCR", capacity: 120, minContribution: 999, efficiency: "High" },
    { name: "Solar Park Alpha", location: "Bangalore, Karnataka", capacity: 100, minContribution: 999, efficiency: "Medium" },
    { name: "Eco Factory Project", location: "Chennai, Tamil Nadu", capacity: 150, minContribution: 999, efficiency: "Medium" }
  ];

  // 🔹 Calculate Energy Rewards per month based on project characteristics
  const calculateEnergyRewardsPerMonth = (project: any, contributionAmount: number): number => {
    // Calculate energy rewards based on contribution amount and project efficiency
    // This is an estimate - actual rewards depend on real energy production
    let monthlyEnergyRate;
    
    // Base energy production rate based on project efficiency
    switch (project.efficiency) {
      case "High":
        // High efficiency projects: ~15 kWh per ₹1000 invested monthly
        monthlyEnergyRate = 0.015;
        break;
      case "Medium":
        // Medium efficiency projects: ~12 kWh per ₹1000 invested monthly
        monthlyEnergyRate = 0.012;
        break;
      case "Low":
        // Lower efficiency projects: ~10 kWh per ₹1000 invested monthly
        monthlyEnergyRate = 0.01;
        break;
      default:
        // Default: ~12 kWh per ₹1000 invested monthly
        monthlyEnergyRate = 0.012;
    }
    
    // Calculate monthly Energy Rewards based on contribution (₹5 per kWh)
    const monthlyEnergy = contributionAmount * monthlyEnergyRate;
    return monthlyEnergy * 5; // ₹5 per kWh
  };

  // 🔹 Calculate Energy Rewards (what users actually receive from energy production)
  const calculateEnergyRewards = (project: any, contributionAmount: number, totalProjectInvestment: number, energyProduced: number): number => {
    // Calculate user's share of energy production based on their investment proportion
    const userShare = contributionAmount / totalProjectInvestment;
    const userEnergyShare = energyProduced * userShare;
    const rewardAmount = userEnergyShare * 5; // ₹5 per kWh (matching backend logic)
    
    return rewardAmount;
  };

  // 🔹 Info popup helper function
  const showInfo = (title: string, content: string) => {
    setInfoContent({ title, content });
    setShowInfoPopup(true);
  };

  // 🔹 Info content definitions
  const infoDefinitions = {
    contributionAmount: {
      title: "Contribution Amount",
      content: "The amount you want to invest in solar projects. This can be any amount above the minimum contribution (₹999). Higher contributions earn more Energy Rewards."
    },
    reservedCapacity: {
      title: "Reserved Capacity",
      content: "The solar energy capacity (in watts) that your contribution reserves for you. This represents your share of the project's total energy generation capacity."
    },
    greenCredits: {
      title: "Monthly Energy Rewards",
      content: "Real money you earn monthly based on your investment and actual energy generation. Rewards are calculated as ₹5 per kWh of energy your investment generates, paid directly to your wallet."
    },
    totalCredits: {
      title: "Total Energy Rewards",
      content: "The total amount of real money you'll earn over the specified operation years. This is calculated as: Monthly Energy Rewards × 12 months × Operation Years. This money is added to your wallet and can be withdrawn."
    },
    co2Avoided: {
      title: "CO₂ Avoided",
      content: "The amount of carbon dioxide emissions avoided by your solar investment. This is calculated based on the clean energy generated by your reserved capacity."
    },
    treesEquivalent: {
      title: "Trees Equivalent",
      content: "The number of trees that would need to be planted to achieve the same CO₂ reduction as your solar investment. This helps visualize your environmental impact."
    },
    operationYears: {
      title: "Operation Years",
      content: "The number of years you want to calculate returns for. Solar projects typically operate for 15-25 years, generating clean energy and Energy Rewards throughout this period."
    }
  };

  // 🔹 Real user subscriptions pulled from backend (grouped per project)
  const [userProjectAllocations, setUserProjectAllocations] = useState<any[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserProjectAllocations(null);
      return;
    }
    let isCancelled = false;
    (async () => {
      try {
        const [subscriptionsRes, engagementRes] = await Promise.all([
          subscriptionsAPI.getSubscriptionHistory(),
          engagementAPI.getEngagementHistory()
        ]);
        const list = subscriptionsRes.data || [];
        const reinvestmentData = engagementRes.data || [];
        
        // Filter only reinvestment transactions
        const reinvestmentTransactions = reinvestmentData.filter(
          (transaction: any) => transaction.type === 'REINVEST'
        );
        setReinvestments(reinvestmentTransactions);
        // Group subscriptions by project
        const byProject = new Map<number, any>();
        for (const sub of list as any[]) {
          const p = sub.project;
          if (!p) continue;
          const existing = byProject.get(p.id) || {
            projectId: p.id,
            name: p.name,
            location: p.location,
            price: 0, // Will be calculated from actual contributions
            capacityPerUnit: p.energyCapacity,
            minContribution: p.minContribution || 999,
            units: 0,
            totalContribution: 0, // Track total actual contributions
          };
          existing.units += 1;
          existing.totalContribution += sub.contributionAmount || 0; // Use actual contribution amount
          byProject.set(p.id, existing);
        }
        if (!isCancelled) {
          const allocations = Array.from(byProject.values()).map((item) => ({
            projectId: item.projectId,
            name: item.name,
            location: item.location,
            price: item.totalContribution, // Use actual total contribution amount
            totalContribution: item.totalContribution, // Add explicit totalContribution field
            contributionAmount: item.totalContribution, // Add contributionAmount for display
            capacity: item.capacityPerUnit * item.units,
            minContribution: item.minContribution,
            units: item.units,
            // Calculate monthly Energy Rewards based on project characteristics
            monthlyCredits: calculateEnergyRewardsPerMonth({
              capacity: item.capacityPerUnit,
              efficiency: "High" // Default efficiency for user projects
            }, item.totalContribution), // Use actual total contribution
          }));
          setUserProjectAllocations(allocations.length ? allocations : null);
        }
      } catch (e) {
        // Fallback to default projects on error
        if (!isCancelled) setUserProjectAllocations(null);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  // 🔹 Recalculate outputs whenever inputs change
  useEffect(() => {
    // If user has real subscriptions, compute from those; otherwise use estimator
    if (userProjectAllocations && userProjectAllocations.length) {
      // Create reactive project breakdown based on current contribution amount
      // Show actual subscription amounts but calculate additional contributions
      const totalOriginal = userProjectAllocations.reduce((sum: number, proj: any) => sum + proj.totalContribution, 0);
      
      // Add reinvestments to totalOriginal to get the true total investment
      const totalReinvestments = reinvestments.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      const totalOriginalWithReinvestments = totalOriginal + totalReinvestments;
      
      // Set state for display (no additional calculation)
      setTotalOriginalContribution(totalOriginalWithReinvestments);
      setAdditionalContribution(0);
      
      const picks = userProjectAllocations.map((p: any) => {
        // Calculate reinvestments for this specific project
        const projectReinvestments = reinvestments.filter((r: any) => r.project?.id === p.projectId);
        const projectReinvestmentTotal = projectReinvestments.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        
        // Total contribution = original + reinvestments (no additional)
        const totalForThisProject = p.totalContribution + projectReinvestmentTotal;
        
        return {
          ...p,
          // Update monthly credits based on total contribution (original + reinvestments)
          monthlyCredits: calculateEnergyRewardsPerMonth({
            capacity: p.capacityPerUnit,
            efficiency: p.efficiency || "High"
          }, totalForThisProject),
          // Show actual subscription amount
          originalContribution: p.totalContribution,
          // Show reinvestments for this project
          reinvestmentTotal: projectReinvestmentTotal,
          // Show total contribution for this project
          contributionAmount: totalForThisProject,
          totalContribution: totalForThisProject,
        };
      });
      
      const totalContribution = picks.reduce((s: number, p: any) => s + p.totalContribution, 0);
      const totalCap = picks.reduce((s: number, p: any) => s + p.capacity, 0);
      
      // Debug: Log the calculation details
      console.log('Calculator Debug:', {
        inputContribution: contributionAmount,
        totalOriginalContribution: totalOriginal,
        additionalContribution: 0,
        calculatedTotalContribution: totalContribution,
        matches: Math.abs(totalContribution - contributionAmount) < 0.01,
        projectBreakdown: picks.map(p => ({
          name: p.name,
          originalContribution: p.originalContribution,
          additionalContribution: 0,
          totalContribution: p.contributionAmount,
          monthlyCredits: p.monthlyCredits
        }))
      });
      // Calculate total monthly Energy Rewards
      const totalMonthlyCredits = picks.reduce((s: number, p: any) => s + p.monthlyCredits, 0);
      const totalCreditsCalc = totalMonthlyCredits * 12 * operationYears;

      const baseTrees = 31340;
      const baseCO2 = 658.1;
      const baseInvestment = 104348;
      const trees = Math.max(0, Math.round((totalContribution / baseInvestment) * baseTrees));
      const co2 = Math.max(0, (totalContribution / baseInvestment) * baseCO2);

      setSelectedProjects(picks);
      setTotalContribution(Math.max(0, Math.round(totalContribution)));
      setReservedCapacity(Math.max(0, Math.round(totalCap)));
      setMonthlyCredits(Math.max(0, Math.round(totalMonthlyCredits)));
      setTotalCredits(Math.max(0, Math.round(totalCreditsCalc)));
      setTreesEquivalent(trees);
      setCo2Avoided(co2);
      return;
    }

    // Estimator path (no real subscriptions) - Solar Capital style
    setTotalOriginalContribution(0);
    setAdditionalContribution(0);
    const userContribution = Math.max(0, contributionAmount);
    
    // Calculate Energy Rewards for each project based on user's contribution
    const projectsWithCredits = defaultProjects.map(p => ({
      ...p,
      monthlyCredits: calculateEnergyRewardsPerMonth(p, userContribution),
      contributionAmount: userContribution
    })).sort((a, b) => b.monthlyCredits - a.monthlyCredits);
    
    // For estimator, show the best project based on user's contribution
    const bestProject = projectsWithCredits[0];
    const picks = bestProject ? [{
      name: bestProject.name,
      location: bestProject.location,
      capacity: bestProject.capacity,
      monthlyCredits: bestProject.monthlyCredits,
      contributionAmount: userContribution,
      efficiency: bestProject.efficiency,
      minContribution: bestProject.minContribution
    }] : [];
    
    const totalContribution = userContribution;
    const totalCap = bestProject ? bestProject.capacity : 0;
    const totalMonthlyCredits = bestProject ? bestProject.monthlyCredits : 0;
    const totalCreditsCalc = totalMonthlyCredits * 12 * operationYears;
    const baseTrees = 31340;
    const baseCO2 = 658.1;
    const baseInvestment = 104348;
    const trees = Math.max(0, Math.round((totalContribution / baseInvestment) * baseTrees));
    const co2 = Math.max(0, (totalContribution / baseInvestment) * baseCO2);
    setSelectedProjects(picks);
    setTotalContribution(Math.max(0, Math.round(totalContribution)));
    setReservedCapacity(Math.max(0, Math.round(totalCap)));
    setMonthlyCredits(Math.max(0, Math.round(totalMonthlyCredits)));
    setTotalCredits(Math.max(0, Math.round(totalCreditsCalc)));
    setTreesEquivalent(trees);
    setCo2Avoided(co2);
  }, [contributionAmount, operationYears, userProjectAllocations, reinvestments]);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <SharedNavigation />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Calculator for both authenticated and non-authenticated users */}
        <div
          className={`${
            isHomePage
              ? "py-16 bg-gradient-to-br from-blue-50 to-indigo-50"
              : "py-8"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  Solar Savings Calculator
                </h1>
                <button
                  onClick={() => showInfo("How the Calculator Works", "This calculator helps you understand the potential returns from solar investments. Enter your contribution amount and operation years to see estimated Energy Rewards, environmental impact, and reserved capacity. Energy Rewards are monthly rewards based on actual energy generation at ₹5 per kWh.")}
                  className="ml-3 text-blue-500 hover:text-blue-700 transition-colors"
                  title="How does this calculator work?"
                >
                  <Lightbulb className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-4 text-gray-600">
                {isAuthenticated 
                  ? "Contribute any amount to solar projects and earn Energy Rewards based on actual energy generation."
                  : "Contribute any amount (minimum ₹999) to solar projects and earn Energy Rewards based on actual energy generation."
                }
              </p>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Contribution Amount (₹)
                        <button
                          onClick={() => showInfo(infoDefinitions.contributionAmount.title, infoDefinitions.contributionAmount.content)}
                          className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                          title="What is contribution amount?"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </label>
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10000"
                        min="999"
                      />
                      <p className="text-sm text-gray-500 mt-1">Minimum: ₹999</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Operation Years
                        <button
                          onClick={() => showInfo(infoDefinitions.operationYears.title, infoDefinitions.operationYears.content)}
                          className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                          title="What are operation years?"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </label>
                      <input
                        type="number"
                        value={operationYears}
                        onChange={(e) => setOperationYears(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15"
                      />
                </div>
              </div>

              {/* Results Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  
                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Your Contribution</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{(totalContribution || 0).toLocaleString()}
                    </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        Reserved Capacity
                        <button
                          onClick={() => showInfo(infoDefinitions.reservedCapacity.title, infoDefinitions.reservedCapacity.content)}
                          className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                          title="What is reserved capacity?"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </span>
                    <span className="text-xl font-bold text-gray-900">
                      {reservedCapacity} W
                    </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      Monthly Energy Rewards
                      <button
                        onClick={() => showInfo(infoDefinitions.greenCredits.title, infoDefinitions.greenCredits.content)}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="What are Energy Rewards?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{(monthlyCredits || 0).toLocaleString()}
                    </span>
                    </div>
                    
                  <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                    <span className="text-gray-700 font-semibold flex items-center">
                      Total Energy Rewards ({operationYears} years)
                      <button
                        onClick={() => showInfo(infoDefinitions.totalCredits.title, infoDefinitions.totalCredits.content)}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="What are total Energy Rewards?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{(totalCredits || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Environmental Impact
                  </h3>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      CO₂ Avoided
                      <button
                        onClick={() => showInfo(infoDefinitions.co2Avoided.title, infoDefinitions.co2Avoided.content)}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="What is CO₂ avoided?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {co2Avoided.toFixed(1)} tons
                    </span>
                    </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 flex items-center">
                      Trees Equivalent
                      <button
                        onClick={() => showInfo(infoDefinitions.treesEquivalent.title, infoDefinitions.treesEquivalent.content)}
                        className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="What is trees equivalent?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {treesEquivalent} trees
                    </span>
                </div>
              </div>
            </div>

              {/* Project Breakdown - Only for authenticated users with real subscriptions */}
            {isAuthenticated && selectedProjects && selectedProjects.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Zap className="h-8 w-8 mr-3 text-green-600" />
                    Project Breakdown
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Total: ₹{(totalContribution || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                      >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {project.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {project.location}
                            </p>
                        </div>
                          <span className="text-green-600 font-bold">
                            ₹{Math.round(project.monthlyCredits || 0)}/month
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Capacity: {project.capacity} W</span>
                          <span>Efficiency: {project.efficiency || "High"}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700 mt-1">
                          <div className="flex flex-col">
                            <span>Actual Subscription: ₹{(project.originalContribution || project.totalContribution || project.price || 0).toLocaleString()}</span>
                            {project.reinvestmentTotal > 0 && (
                              <span className="text-green-600">+ Reinvestment: ₹{(project.reinvestmentTotal || 0).toLocaleString()}</span>
                            )}
                          </div>
                          <span>Min: ₹{(project.minContribution || 999).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Subscriptions Message */}
            {isAuthenticated && (!userProjectAllocations || userProjectAllocations.length === 0) && (
              <div className="mt-8 bg-blue-50 rounded-2xl shadow-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No Active Subscriptions
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't subscribed to any solar projects yet. Start investing to see your project breakdown here.
                </p>
                <button
                  onClick={() => window.location.href = '/app/projects'}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Projects
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Popup Modal */}
      {showInfoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">{infoContent.title}</h3>
              </div>
              <button
                onClick={() => setShowInfoPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed">
              {infoContent.content}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoPopup(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarCalculator;
