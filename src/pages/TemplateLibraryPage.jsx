import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, FileX } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import individual sidebar components AND their subcategories
import AccountsSidebar, { accountsSubcategories } from '../components/sidebars/AccountsSidebar';
import HRSidebar, { hrSubcategories } from '../components/sidebars/HRSidebar';
import LegalSidebar, { legalSubcategories } from '../components/sidebars/LegalSidebar';
import BusinessSidebar, { businessSubcategories } from '../components/sidebars/BusinessSidebar';
import MarketingSidebar, { marketingSubcategories } from '../components/sidebars/MarketingSidebar';

// Import all subcategory components
import {
  AccountingTemplates,
  IncomeTax,
  InventoryManagement,
  Invoices,
  MISReports,
  SalesTax,
  TDSTCS
} from '../components/subcategories/accounts';

import {
  Statutories,
  EngagementPlans,
  PerformanceManagement,
  RecordsFormats,
  TrainingModules,
  EmployeePolicy,
  ExitProcess,
  EmployeeOnboarding,
  CompanyForms,
  HRForms,
  JobDescriptions
} from '../components/subcategories/hr';

import {
  Affidavits,
  AgreementFormats,
  BoardResolutions,
  Bonds,
  Copyrights
} from '../components/subcategories/legal';

import {
  BusinessPlans,
  MISTemplates,
  Notices,
  PitchDecks,
  Quotations,
  SalesReports,
  SurveyTemplates
} from '../components/subcategories/business';

import {
  EmailTemplates,
  IndianFestivalInfographics,
  SocialMediaTemplates,
  MarketingReports,
  CampaignPlans
} from '../components/subcategories/marketing';

// Import template components
import TemplateGrid from '../components/template/TemplateGrid';
import PreviewDialog from '../components/template/PreviewDialog';
import UpgradeDialog from '../components/template/UpgradeDialog';

const TemplateLibraryPage = () => {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Employee Onboarding');
  const [filters, setFilters] = useState({ fileType: 'all', access: 'all' });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, template) => {
    if (!user) {
      setUpgradeModalOpen(true);
      return;
    }
    
    const userPlan = user.plan || 'Free';
    const requiredPlan = template.access;

    const planHierarchy = { 'Free': 0, 'Pro': 1, 'Business': 2 };

    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      setUpgradeModalOpen(true);
      return;
    }

    switch (action) {
      case 'edit':
        navigate(`/editor/${template.id}`);
        break;
      case 'download':
        toast({ 
          title: "Download Started", 
          description: `${template.title || template.name} is being downloaded...` 
        });
        break;
      case 'preview':
        setPreviewTemplate(template);
        break;
      default:
        break;
    }
  };

  const handleFavorite = (templateId) => {
    if (!user) {
      setUpgradeModalOpen(true);
      return;
    }
    toast({ 
      title: "Added to Favorites!", 
      description: "You can find this template in your dashboard." 
    });
  };

  const handleCategoryChange = (category, defaultSubcategory) => {
    setSelectedCategory(category);
    setSelectedSubCategory(defaultSubcategory);
  };

  // Common props for all sidebar components
  const sidebarProps = {
    selectedCategory,
    onCategoryChange: handleCategoryChange
  };

  // Map subcategory names to components
  const getSubcategoryComponent = (category, subcategory) => {
    const componentMap = {
      accounts: {
        'Accounting Templates': AccountingTemplates,
        'Income Tax': IncomeTax,
        'Inventory Management': InventoryManagement,
        'Invoices': Invoices,
        'MIS Reports': MISReports,
        'Sales Tax': SalesTax,
        'TDS & TCS': TDSTCS
      },
      hr: {
        'Statutories': Statutories,
        'Engagement Plans': EngagementPlans,
        'Performance Management': PerformanceManagement,
        'Records & Formats': RecordsFormats,
        'Training Modules': TrainingModules,
        'Employee Policy': EmployeePolicy,
        'Exit Process': ExitProcess,
        'Employee Onboarding': EmployeeOnboarding,
        'Company Forms': CompanyForms,
        'HR Forms': HRForms,
        'Job Descriptions': JobDescriptions
      },
      legal: {
        'Affidavits': Affidavits,
        'Agreement Formats': AgreementFormats,
        'Board Resolutions': BoardResolutions,
        'Bonds': Bonds,
        'Copyrights': Copyrights
      },
      business: {
        'Business Plans': BusinessPlans,
        'MIS Templates': MISTemplates,
        'Notices': Notices,
        'Pitch Decks': PitchDecks,
        'Quotations': Quotations,
        'Sales Reports': SalesReports,
        'Survey Templates': SurveyTemplates
      },
      marketing: {
        'Email Templates': EmailTemplates,
        'Indian Festival Infographics': IndianFestivalInfographics,
        'Social Media Templates': SocialMediaTemplates,
        'Marketing Reports': MarketingReports,
        'Campaign Plans': CampaignPlans
      }
    };

    const Component = componentMap[category]?.[subcategory];
    return Component ? <Component /> : <div className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-2xl font-bold text-gray-900">Content for {subcategory} coming soon...</h2></div>;
  };

  const filteredTemplates = templates.filter(template =>
    template.category === selectedCategory &&
    template.subcategory === selectedSubCategory &&
    (searchQuery === '' || 
     (template.title || template.name).toLowerCase().includes(searchQuery.toLowerCase()) || 
     template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (filters.fileType === 'all' || template.format.toLowerCase() === filters.fileType) &&
    (filters.access === 'all' || template.access.toLowerCase() === filters.access)
  );

  const renderTabs = () => {
    // Use the imported subcategories from sidebar components
    const categories = {
      accounts: { subcategories: accountsSubcategories },
      hr: { subcategories: hrSubcategories },
      legal: { subcategories: legalSubcategories },
      business: { subcategories: businessSubcategories },
      marketing: { subcategories: marketingSubcategories }
    };

    const currentCategory = categories[selectedCategory];

    return (
      <Tabs value={selectedSubCategory} onValueChange={setSelectedSubCategory} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto bg-white p-2 rounded-lg shadow">
          {currentCategory.subcategories.map((sub) => (
            <TabsTrigger key={sub} value={sub} className="px-4 py-2">
              {sub}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedSubCategory}>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Render the specific subcategory component
            getSubcategoryComponent(selectedCategory, selectedSubCategory)
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Helmet>
        <title>Explore Templates - StartupDocs Builder</title>
        <meta name="description" content="Browse 1000+ professional business document templates across Accounts, HR, Legal, Business, and Marketing categories." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📂 Explore Templates
            </h1>
            <p className="text-xl text-gray-600">Browse and customize professional business templates</p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                type="text" 
                placeholder="Search templates by name or keyword..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 h-12 text-lg" 
              />
            </div>
            <Select 
              value={filters.fileType} 
              onValueChange={(value) => setFilters(f => ({...f, fileType: value}))}
            >
              <SelectTrigger className="h-12 w-full md:w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All File Types</SelectItem>
                <SelectItem value="docx">Word (.docx)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.access} 
              onValueChange={(value) => setFilters(f => ({...f, access: value}))}
            >
              <SelectTrigger className="h-12 w-full md:w-[180px]">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Single container with all category buttons */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Categories</h2>
                <div className="space-y-2">
                  {/* All 5 sidebar components render just their buttons */}
                  <AccountsSidebar {...sidebarProps} />
                  <HRSidebar {...sidebarProps} />
                  <LegalSidebar {...sidebarProps} />
                  <BusinessSidebar {...sidebarProps} />
                  <MarketingSidebar {...sidebarProps} />
                </div>
              </div>
            </div>

            {/* Templates Content */}
            <div className="lg:col-span-3">
              {renderTabs()}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Dialogs */}
      <PreviewDialog 
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />

      <UpgradeDialog 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        user={user}
        navigate={navigate}
      />
    </>
  );
};

export default TemplateLibraryPage;