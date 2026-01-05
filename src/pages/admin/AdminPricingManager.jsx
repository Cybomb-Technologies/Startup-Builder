// src/pages/admin/AdminPricingManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Zap,
  FileText,
  Crown,
  Building2,
  ArrowUp,
  ArrowDown,
  IndianRupee,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const AdminPricingManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    planId: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [{ name: '', included: true }],
    popular: false,
    active: true,
    downloadLimit: '',
    storage: '',
    supportType: '',
    icon: 'Zap',
    color: 'blue',
    ctaText: 'Get Started',
    annualDiscount: 15,
    position: 0
  });

  const colorOptions = [
    { value: 'blue', label: 'Blue', gradient: 'from-blue-500 to-cyan-600' },
    { value: 'purple', label: 'Purple', gradient: 'from-purple-500 to-pink-600' },
    { value: 'green', label: 'Green', gradient: 'from-green-500 to-emerald-600' },
    { value: 'orange', label: 'Orange', gradient: 'from-orange-500 to-red-600' },
    { value: 'indigo', label: 'Indigo', gradient: 'from-indigo-500 to-blue-600' },
  ];

  const icons = {
    Zap: Zap,
    FileText: FileText,
    Crown: Crown,
    Building2: Building2
  };

  const getAuthHeaders = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      console.error('❌ No admin session found');
      return {};
    }

    try {
      const userData = JSON.parse(adminUser);
      const token = userData.token;

      if (!token) {
        console.error('❌ No token found in admin session');
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('❌ Error parsing admin user data:', error);
      return {};
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/all`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by position
        const sortedPlans = data.plans.sort((a, b) => a.position - b.position);
        setPlans(sortedPlans);
      } else {
        throw new Error('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index][field] = value;
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', included: true }]
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length <= 1) {
      toast({
        title: 'Cannot remove',
        description: 'At least one feature is required',
        variant: 'destructive'
      });
      return;
    }
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan.planId);
    setFormData({
      name: plan.name,
      planId: plan.planId,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: plan.features.map(f => ({ ...f })),
      popular: plan.popular,
      active: plan.active,
      downloadLimit: plan.downloadLimit,
      storage: plan.storage,
      supportType: plan.supportType,
      icon: plan.icon,
      color: colorOptions.find(c => c.gradient === plan.color)?.value || 'blue',
      ctaText: plan.ctaText,
      annualDiscount: plan.annualDiscount,
      position: plan.position
    });
    setIsCreating(false);

    // Scroll to form
    setTimeout(() => {
      document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPlan(null);
    setFormData({
      name: '',
      planId: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [{ name: '', included: true }],
      popular: false,
      active: true,
      downloadLimit: '',
      storage: '',
      supportType: '',
      icon: 'Zap',
      color: 'blue',
      ctaText: 'Get Started',
      annualDiscount: 15,
      position: plans.length
    });

    // Scroll to form
    setTimeout(() => {
      document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setFormData({
      name: '',
      planId: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [{ name: '', included: true }],
      popular: false,
      active: true,
      downloadLimit: '',
      storage: '',
      supportType: '',
      icon: 'Zap',
      color: 'blue',
      ctaText: 'Get Started',
      annualDiscount: 15,
      position: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      const colorGradient = colorOptions.find(c => c.value === formData.color)?.gradient || 'from-blue-500 to-cyan-600';

      const payload = {
        ...formData,
        color: colorGradient
      };

      const url = isCreating
        ? `${API_BASE_URL}/api/pricing/admin/create`
        : `${API_BASE_URL}/api/pricing/admin/update/${formData.planId}`;

      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Plan ${isCreating ? 'created' : 'updated'} successfully`
        });
        fetchPlans();
        handleCancel();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isCreating ? 'create' : 'update'} plan: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/delete/${planId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Plan deleted successfully'
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: `Failed to delete plan: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (planId, currentStatus) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/toggle/${planId}`, {
        method: 'PATCH',
        headers
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Plan ${currentStatus ? 'deactivated' : 'activated'} successfully`
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle plan status');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: 'Error',
        description: `Failed to update plan status: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const movePlan = async (planId, direction) => {
    const planIndex = plans.findIndex(p => p.planId === planId);
    if ((direction === 'up' && planIndex === 0) ||
      (direction === 'down' && planIndex === plans.length - 1)) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      const newPosition = direction === 'up' ? plans[planIndex - 1].position : plans[planIndex + 1].position;

      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/update/${planId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ position: newPosition })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Plan moved ${direction}`
        });
        fetchPlans();
      } else {
        throw new Error('Failed to update position');
      }
    } catch (error) {
      console.error('Error updating plan position:', error);
      toast({
        title: 'Error',
        description: 'Failed to move plan',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pricing Plans Manager</h1>
            <p className="text-gray-600 mt-1">Manage your subscription plans and pricing</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(isCreating || editingPlan) && (
            <motion.div
              id="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      {isCreating ? 'Create New Plan' : `Edit: ${formData.name}`}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Plan Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Pro Plan"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Plan ID *
                        </label>
                        <Input
                          value={formData.planId}
                          onChange={(e) => handleInputChange('planId', e.target.value)}
                          placeholder="e.g., pro"
                          required
                          disabled={!isCreating}
                          className={!isCreating ? 'bg-gray-100' : ''}
                        />
                        <p className="text-xs text-gray-500">Unique identifier for the plan</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the plan features and benefits..."
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Monthly Price (₹) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.monthlyPrice || ''}
                          onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Yearly Price (₹) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.yearlyPrice || ''}
                          onChange={(e) => handleInputChange('yearlyPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Annual Discount (%) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.annualDiscount || ''}
                          onChange={(e) => handleInputChange('annualDiscount', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Download Limit *
                        </label>
                        <Input
                          value={formData.downloadLimit}
                          onChange={(e) => handleInputChange('downloadLimit', e.target.value)}
                          placeholder="e.g., 1000/month"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Storage *
                        </label>
                        <Input
                          value={formData.storage}
                          onChange={(e) => handleInputChange('storage', e.target.value)}
                          placeholder="e.g., 50GB"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Support Type *
                        </label>
                        <Input
                          value={formData.supportType}
                          onChange={(e) => handleInputChange('supportType', e.target.value)}
                          placeholder="e.g., Priority Email"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Icon *
                        </label>
                        <Select
                          value={formData.icon}
                          onValueChange={(value) => handleInputChange('icon', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Zap">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Zap</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="FileText">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>FileText</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Crown">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4" />
                                <span>Crown</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Building2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span>Building</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Color Theme *
                        </label>
                        <Select
                          value={formData.color}
                          onValueChange={(value) => handleInputChange('color', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${color.gradient}`}></div>
                                  <span>{color.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        CTA Button Text *
                      </label>
                      <Input
                        value={formData.ctaText}
                        onChange={(e) => handleInputChange('ctaText', e.target.value)}
                        placeholder="e.g., Get Started, Buy Now"
                        required
                      />
                    </div>

                    {/* Features Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Features *
                        </label>
                        <Button
                          type="button"
                          onClick={addFeature}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Feature
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Input
                              value={feature.name}
                              onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                              placeholder="e.g., Unlimited downloads"
                              className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-sm">
                                <Switch
                                  checked={feature.included}
                                  onCheckedChange={(checked) => handleFeatureChange(index, 'included', checked)}
                                />
                                <span className="text-gray-700">Included</span>
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeature(index)}
                                disabled={formData.features.length === 1}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3">
                        <Switch
                          checked={formData.popular}
                          onCheckedChange={(checked) => handleInputChange('popular', checked)}
                        />
                        <div>
                          <span className="font-medium">Mark as Popular</span>
                          <p className="text-sm text-gray-500">Show a "Popular" badge</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <Switch
                          checked={formData.active}
                          onCheckedChange={(checked) => handleInputChange('active', checked)}
                        />
                        <div>
                          <span className="font-medium">Active</span>
                          <p className="text-sm text-gray-500">Plan is visible to users</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'Create Plan' : 'Update Plan'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans List */}
        <div className="space-y-4">
          <AnimatePresence>
            {plans
              .filter(plan => !editingPlan || plan.planId !== editingPlan)
              .map((plan, index) => {
                const IconComponent = icons[plan.icon] || Zap;
                const colorInfo = colorOptions.find(c => c.gradient === plan.color) || colorOptions[0];

                return (
                  <motion.div
                    key={plan._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-lg shadow-lg border-l-4 ${plan.popular ? 'border-blue-500' : 'border-gray-300'
                      } ${!plan.active ? 'opacity-70' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Section - Plan Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {/* Move Buttons */}
                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => movePlan(plan.planId, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => movePlan(plan.planId, 'down')}
                                disabled={index === plans.length - 1}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-md`}>
                              <IconComponent className="w-7 h-7 text-white" />
                            </div>

                            {/* Plan Details */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="flex gap-2">
                                  {plan.popular && (
                                    <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                      Popular
                                    </Badge>
                                  )}
                                  {!plan.active && (
                                    <Badge variant="outline" className="text-gray-500">
                                      Inactive
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-gray-500">
                                    Position: {plan.position}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-gray-600 mb-4">{plan.description}</p>

                              {/* Pricing */}
                              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                                <div className="flex items-baseline">
                                  <IndianRupee className="w-5 h-5 text-gray-700 mr-1" />
                                  <span className="text-2xl font-bold text-gray-900">{plan.monthlyPrice}</span>
                                  <span className="text-gray-600 ml-1">/month</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  <span className="line-through">
                                    <IndianRupee className="w-3 h-3 inline mr-0.5" />
                                    {(plan.monthlyPrice * 12).toFixed(2)}
                                  </span>
                                  {' '}→{' '}
                                  <span className="text-green-600 font-medium">
                                    <IndianRupee className="w-3 h-3 inline mr-0.5" />
                                    {plan.yearlyPrice}/year
                                  </span>
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                    Save {plan.annualDiscount}%
                                  </span>
                                </div>
                              </div>

                              {/* Features Preview */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {plan.features.slice(0, 4).map((feature, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    {feature.included ? (
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    )}
                                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                                      {feature.name}
                                    </span>
                                  </div>
                                ))}
                                {plan.features.length > 4 && (
                                  <div className="text-blue-600 text-sm">
                                    +{plan.features.length - 4} more features
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="lg:w-48 flex flex-col gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEdit(plan)}
                            className="justify-start"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Plan
                          </Button>
                          <Button
                            variant={plan.active ? "outline" : "default"}
                            onClick={() => handleToggleStatus(plan.planId, plan.active)}
                            className="justify-start"
                          >
                            {plan.active ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(plan.planId)}
                            className="justify-start"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {plans.length === 0 && !isCreating && !editingPlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing plans yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first pricing plan to start offering subscriptions to your users.
                </p>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Plan
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats Footer */}
        {plans.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{plans.filter(p => p.active).length} Active Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{plans.filter(p => p.popular).length} Popular Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>{plans.filter(p => !p.active).length} Inactive Plans</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPricingManager;