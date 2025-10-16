import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, FileText, Download, Edit, BookmarkPlus, Filter, FileType, FileUp, FileDown, FileX, X, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const categories = {
  accounts: {
    name: 'Accounts',
    icon: '📊',
    subcategories: ['Accounting Templates', 'Income Tax', 'Inventory Management', 'Invoices', 'MIS Reports', 'Sales Tax', 'TDS & TCS']
  },
  hr: {
    name: 'Human Resources',
    icon: '👥',
    subcategories: ['Statutories', 'Engagement Plans', 'Performance Management', 'Records & Formats', 'Training Modules', 'Employee Policy', 'Exit Process', 'Employee Onboarding', 'Company Forms', 'HR Forms', 'Job Descriptions']
  },
  legal: {
    name: 'Legal',
    icon: '📑',
    subcategories: ['Affidavits', 'Agreement Formats', 'Board Resolutions', 'Bonds', 'Copyrights']
  },
  business: {
    name: 'Business',
    icon: '💼',
    subcategories: ['Business Plans', 'MIS Templates', 'Notices', 'Pitch Decks', 'Quotations', 'Sales Reports', 'Survey Templates']
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    subcategories: ['Email Templates', 'Indian Festival Infographics']
  }
};

const initialTemplates = [
    { id: 1, title: 'Employee Appointment Letter', category: 'hr', subcategory: 'Employee Onboarding', format: 'DOCX', description: 'Standard format for new employee onboarding.', access: 'Pro', tags: ['HR', 'Agreement'], lastUpdated: '2025-10-15', size: '24KB' },
    { id: 2, name: 'Employment Agreement', category: 'legal', subcategory: 'Agreement Formats', format: 'DOCX', description: 'Standard employment contract', access: 'Business', tags: ['Legal', 'Contract'], lastUpdated: '2025-10-14', size: '32KB' },
    { id: 3, name: 'Offer Letter', category: 'hr', subcategory: 'Employee Onboarding', format: 'DOCX', description: 'Professional offer letter template', access: 'Free', tags: ['HR', 'Onboarding'], lastUpdated: '2025-10-12', size: '22KB' },
    { id: 4, name: 'Business Plan', category: 'business', subcategory: 'Business Plans', format: 'DOCX', description: 'Comprehensive business plan template', access: 'Pro', tags: ['Business', 'Strategy'], lastUpdated: '2025-10-11', size: '128KB' },
    { id: 5, name: 'Email Campaign', category: 'marketing', subcategory: 'Email Templates', format: 'PDF', description: 'Marketing email template', access: 'Free', tags: ['Marketing', 'Email'], lastUpdated: '2025-10-10', size: '45KB' },
    { id: 6, name: 'Balance Sheet', category: 'accounts', subcategory: 'Accounting Templates', format: 'XLSX', description: 'Financial balance sheet template', access: 'Pro', tags: ['Accounts', 'Finance'], lastUpdated: '2025-10-09', size: '56KB' },
    { id: 7, name: 'NDA Agreement', category: 'legal', subcategory: 'Agreement Formats', format: 'DOCX', description: 'Non-disclosure agreement', access: 'Business', tags: ['Legal', 'NDA'], lastUpdated: '2025-10-08', size: '28KB' },
    { id: 8, name: 'Performance Review', category: 'hr', subcategory: 'Performance Management', format: 'DOCX', description: 'Employee performance evaluation', access: 'Pro', tags: ['HR', 'Review'], lastUpdated: '2025-10-07', size: '35KB' },
    { id: 9, name: 'Sales Proposal', category: 'business', subcategory: 'Sales Reports', format: 'DOCX', description: 'Professional sales proposal', access: 'Pro', tags: ['Business', 'Sales'], lastUpdated: '2025-10-06', size: '48KB' },
    { id: 10, name: 'Pitch Deck', category: 'business', subcategory: 'Pitch Decks', format: 'PDF', description: 'Investor pitch deck template', access: 'Free', tags: ['Business', 'Pitch'], lastUpdated: '2025-10-05', size: '2.3MB' },
    { id: 11, name: 'GST Invoice', category: 'accounts', subcategory: 'Invoices', format: 'XLSX', description: 'GST compliant invoice format.', access: 'Free', tags: ['Accounts', 'Invoice', 'GST'], lastUpdated: '2025-10-16', size: '18KB' },
];

const FileIcon = ({ format }) => {
  if (format === 'DOCX') return <FileType className="w-20 h-20 text-blue-600" />;
  if (format === 'XLSX') return <FileUp className="w-20 h-20 text-green-600" />;
  if (format === 'PDF') return <FileDown className="w-20 h-20 text-red-600" />;
  return <FileText className="w-20 h-20 text-gray-600" />;
};

const TemplateLibraryPage = () => {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Employee Onboarding');
  const [filters, setFilters] = useState({ fileType: 'all', access: 'all' });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const storedTemplates = JSON.parse(localStorage.getItem('templates'));
    if (storedTemplates && storedTemplates.length > 0) {
      setTemplates(storedTemplates);
    } else {
      localStorage.setItem('templates', JSON.stringify(initialTemplates));
      setTemplates(initialTemplates);
    }
  }, []);

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
        toast({ title: "Download Started", description: `${template.title || template.name} is being downloaded...` });
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
    toast({ title: "Added to Favorites!", description: "You can find this template in your dashboard." });
  };

  const filteredTemplates = templates.filter(template =>
    template.category === selectedCategory &&
    template.subcategory === selectedSubCategory &&
    (searchQuery === '' || (template.title || template.name).toLowerCase().includes(searchQuery.toLowerCase()) || template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (filters.fileType === 'all' || template.format.toLowerCase() === filters.fileType) &&
    (filters.access === 'all' || template.access.toLowerCase() === filters.access)
  );

  return (
    <>
      <Helmet>
        <title>Explore Templates - StartupDocs Builder</title>
        <meta name="description" content="Browse 1000+ professional business document templates across Accounts, HR, Legal, Business, and Marketing categories." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📂 Explore Templates
            </h1>
            <p className="text-xl text-gray-600">Browse and customize professional business templates</p>
          </motion.div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input type="text" placeholder="Search templates by name or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-lg" />
            </div>
            <Select value={filters.fileType} onValueChange={(value) => setFilters(f => ({...f, fileType: value}))}>
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
            <Select value={filters.access} onValueChange={(value) => setFilters(f => ({...f, access: value}))}>
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

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Categories</h2>
                <div className="space-y-2">
                  {Object.entries(categories).map(([key, category]) => (
                    <button key={key} onClick={() => { setSelectedCategory(key); setSelectedSubCategory(category.subcategories[0]); }} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === key ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}>
                      <span className="mr-2">{category.icon}</span>{category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Tabs value={selectedSubCategory} onValueChange={setSelectedSubCategory} className="w-full">
                <TabsList className="mb-6 flex-wrap h-auto bg-white p-2 rounded-lg shadow">
                  {categories[selectedCategory].subcategories.map((sub) => (
                    <TabsTrigger key={sub} value={sub} className="px-4 py-2">{sub}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedSubCategory}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredTemplates.length > 0 ? filteredTemplates.map((template, index) => (
                      <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
                          <FileIcon format={template.format} />
                          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold text-white ${template.access === 'Free' ? 'bg-green-500' : template.access === 'Pro' ? 'bg-blue-500' : 'bg-purple-500'}`}>{template.access}</span>
                        </div>
                        <div className="p-6">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h3 className="text-xl font-semibold text-gray-900 truncate">{template.title || template.name}</h3>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Last Updated: {template.lastUpdated}</p>
                                <p>File Size: {template.size}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-gray-600 my-2 h-10">{template.description}</p>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">.{template.format.toLowerCase()}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{template.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleAction('preview', template)} variant="outline" className="flex-1">Preview</Button>
                            <Button onClick={() => handleAction('edit', template)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">Edit Online</Button>
                            <Button onClick={() => handleAction('download', template)} variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleFavorite(template.id)} variant="outline">
                              <Star className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-2 text-center py-12">
                        <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-2">No templates found</p>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewTemplate?.title || previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">File preview would be shown here.</p>
            </div>
            <div className="mt-4 space-y-2">
              <p><strong>Category:</strong> {previewTemplate?.category}</p>
              <p><strong>Subcategory:</strong> {previewTemplate?.subcategory}</p>
              <p><strong>Format:</strong> {previewTemplate?.format}</p>
              <p><strong>Access:</strong> {previewTemplate?.access}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Upgrade Required</DialogTitle>
            <DialogDescription>
              {user ? "Your current plan doesn't include access to this template." : "Please log in or sign up to access templates."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-6">
              {user ? "Upgrade your plan to unlock this template and many more powerful features." : "Join StartupDocs Builder to start creating and downloading documents."}
            </p>
            <Button onClick={() => navigate(user ? '/pricing' : '/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              {user ? 'Upgrade to Pro' : 'Login or Sign Up'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateLibraryPage;