// src/pages/admin/AdminPricingManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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
    color: 'from-blue-500 to-cyan-600',
    ctaText: '',
    annualDiscount: 15
  });

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
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/pricing/admin/all', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
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
      color: plan.color,
      ctaText: plan.ctaText,
      annualDiscount: plan.annualDiscount
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
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
      color: 'from-blue-500 to-cyan-600',
      ctaText: '',
      annualDiscount: 15
    });
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
      color: 'from-blue-500 to-cyan-600',
      ctaText: '',
      annualDiscount: 15
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

      const url = isCreating 
        ? 'http://localhost:5000/api/pricing/admin/create'
        : `http://localhost:5000/api/pricing/admin/update/${formData.planId}`;
      
      const method = isCreating ? 'POST' : 'PUT';
      
      console.log('Sending request to:', url, 'with method:', method);
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
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
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
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

      const response = await fetch(`http://localhost:5000/api/pricing/admin/delete/${planId}`, {
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

      const response = await fetch(`http://localhost:5000/api/pricing/admin/toggle/${planId}`, {
        method: 'PATCH',
        headers
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Plan ${currentStatus ? 'deactivated' : 'activated'}`
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
        (direction === 'down' && planIndex === plans.length - 1)) return;
    
    const newPosition = direction === 'up' ? planIndex - 1 : planIndex + 1;
    const updatedPlans = [...plans];
    const temp = updatedPlans[planIndex].position;
    updatedPlans[planIndex].position = updatedPlans[newPosition].position;
    updatedPlans[newPosition].position = temp;
    
    // Re-sort based on new positions
    updatedPlans.sort((a, b) => a.position - b.position);
    setPlans(updatedPlans);
    
    // Update in backend
    try {
      const headers = getAuthHeaders();
      await fetch(`http://localhost:5000/api/pricing/admin/update/${planId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ position: updatedPlans[planIndex].position })
      });
    } catch (error) {
      console.error('Error updating plan position:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 mb-4 shadow">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Plans Manager</h1>
            <p className="text-gray-600">Manage your subscription plans and pricing</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingPlan) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isCreating ? 'Create New Plan' : 'Edit Plan'}
              </h2>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan ID
                  </label>
                  <Input
                    value={formData.planId}
                    onChange={(e) => handleInputChange('planId', e.target.value)}
                    required
                    disabled={!isCreating}
                    placeholder="free, pro, business, enterprise"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price (INR)
                  </label>
                  <Input
                    type="number"
                    value={formData.monthlyPrice || ''}
                    onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yearly Price (INR)
                  </label>
                  <Input
                    type="number"
                    value={formData.yearlyPrice || ''}
                    onChange={(e) => handleInputChange('yearlyPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Discount (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.annualDiscount || ''}
                    onChange={(e) => handleInputChange('annualDiscount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Download Limit
                  </label>
                  <Input
                    value={formData.downloadLimit}
                    onChange={(e) => handleInputChange('downloadLimit', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage
                  </label>
                  <Input
                    value={formData.storage}
                    onChange={(e) => handleInputChange('storage', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Type
                  </label>
                  <Input
                    value={formData.supportType}
                    onChange={(e) => handleInputChange('supportType', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Zap">Zap</option>
                    <option value="FileText">FileText</option>
                    <option value="Crown">Crown</option>
                    <option value="Building2">Building2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Text
                  </label>
                  <Input
                    value={formData.ctaText}
                    onChange={(e) => handleInputChange('ctaText', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Gradient
                </label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="from-blue-500 to-cyan-600"
                  required
                />
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Features
                  </label>
                  <Button type="button" onClick={addFeature} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={feature.name}
                        onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                        placeholder="Feature description"
                        className="flex-1"
                      />
                      <label className="flex items-center gap-1 text-sm">
                        <Switch
                          checked={feature.included}
                          onCheckedChange={(checked) => handleFeatureChange(index, 'included', checked)}
                        />
                        <span>Included</span>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={formData.features.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={formData.popular}
                    onCheckedChange={(checked) => handleInputChange('popular', checked)}
                  />
                  <span>Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange('active', checked)}
                  />
                  <span>Active</span>
                </label>
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? 'Create Plan' : 'Update Plan'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Plans List */}
        <div className="space-y-4">
          {plans.map((plan, index) => {
            const IconComponent = icons[plan.icon] || Zap;
            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-300'
                } ${!plan.active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Move buttons */}
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePlan(plan.planId, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePlan(plan.planId, 'down')}
                        disabled={index === plans.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Plan Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        {plan.popular && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Popular
                          </span>
                        )}
                        {!plan.active && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{plan.description}</p>
                      
                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          <IndianRupee className="w-5 h-5 inline mr-1" />
                          {plan.monthlyPrice}
                        </span>
                        <span className="text-gray-600">/month</span>
                        <span className="text-gray-500 text-sm">
                          (Yearly: ₹{plan.yearlyPrice} - Save {plan.annualDiscount}%)
                        </span>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {plan.features.slice(0, 6).map((feature, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${feature.included ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 6 && (
                          <span className="text-blue-600 text-sm">+{plan.features.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(plan.planId, plan.active)}
                    >
                      {plan.active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {plan.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.planId)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {plans.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing plans</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first pricing plan.</p>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPricingManager;