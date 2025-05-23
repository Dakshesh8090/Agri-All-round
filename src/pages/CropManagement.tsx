import { useState, useEffect } from 'react';
import { Leaf, Plus, Search, Edit2, Trash2, Calendar, Droplet, HeadingIcon as SeedingIcon, ArrowDownUp, X } from 'lucide-react';
import { cropService } from '../services/api';
import { useCropStore, type Crop } from '../stores/cropStore';
import Button from '../components/common/Button';
import { useForm } from 'react-hook-form';

// Define types
type SortField = 'name' | 'type' | 'plantingDate' | 'expectedHarvest';
type SortOrder = 'asc' | 'desc';

interface CropFormData {
  name: string;
  type: string;
  plantingDate: string;
  expectedHarvest: string;
  soilType: string;
  growthStage: string;
}

const CropManagement = () => {
  const { crops, setCrops, addCrop, updateCrop, deleteCrop, isLoading, setLoading, setError } = useCropStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCrop, setCurrentCrop] = useState<Crop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('plantingDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CropFormData>();
  
  // Crop types and growth stages for select options
  const cropTypes = ['Cereal', 'Vegetable', 'Fruit', 'Pulse', 'Oilseed', 'Fiber', 'Root', 'Other'];
  const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturation', 'Harvested'];
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky', 'Sandy Loam', 'Clay Loam'];
  
  // Fetch crops on component mount
  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const data = await cropService.getCrops();
        setCrops(data);
      } catch (error) {
        console.error('Error fetching crops:', error);
        setError('Failed to load crops. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrops();
  }, []);
  
  // Filter crops based on search term
  const filteredCrops = crops.filter((crop) => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.soilType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort crops based on sort field and order
  const sortedCrops = [...filteredCrops].sort((a, b) => {
    if (sortField === 'name' || sortField === 'type') {
      return sortOrder === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    } else {
      // For date fields
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });
  
  // Toggle sort order or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Open add/edit modal
  const openAddModal = () => {
    reset({
      name: '',
      type: cropTypes[0],
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: '',
      soilType: soilTypes[0],
      growthStage: growthStages[0],
    });
    setIsAddModalOpen(true);
  };
  
  // Open edit modal with current crop data
  const openEditModal = (crop: Crop) => {
    setCurrentCrop(crop);
    setValue('name', crop.name);
    setValue('type', crop.type);
    setValue('plantingDate', crop.plantingDate.split('T')[0]);
    setValue('expectedHarvest', crop.expectedHarvest.split('T')[0]);
    setValue('soilType', crop.soilType);
    setValue('growthStage', crop.growthStage);
    setIsEditModalOpen(true);
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (crop: Crop) => {
    setCurrentCrop(crop);
    setIsDeleteModalOpen(true);
  };
  
  // Handle form submit for adding new crop
  const onAddSubmit = async (data: CropFormData) => {
    try {
      setLoading(true);
      const newCrop = await cropService.addCrop(data);
      addCrop(newCrop);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding crop:', error);
      setError('Failed to add crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submit for editing crop
  const onEditSubmit = async (data: CropFormData) => {
    if (!currentCrop) return;
    
    try {
      setLoading(true);
      const updatedCrop = await cropService.updateCrop(currentCrop.id, data);
      updateCrop(currentCrop.id, updatedCrop);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating crop:', error);
      setError('Failed to update crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!currentCrop) return;
    
    try {
      setLoading(true);
      await cropService.deleteCrop(currentCrop.id);
      deleteCrop(currentCrop.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting crop:', error);
      setError('Failed to delete crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Crop Management</h1>
          <Button
            onClick={openAddModal}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Crop
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crops by name, type, or soil type..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {/* Crop List */}
        {isLoading ? (
          <div className="py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 h-24 rounded-md"></div>
              ))}
            </div>
          </div>
        ) : sortedCrops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center"
                    >
                      Crop Name
                      {sortField === 'name' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center"
                    >
                      Type
                      {sortField === 'type' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('plantingDate')}
                      className="flex items-center"
                    >
                      Planting Date
                      {sortField === 'plantingDate' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('expectedHarvest')}
                      className="flex items-center"
                    >
                      Expected Harvest
                      {sortField === 'expectedHarvest' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCrops.map((crop) => (
                  <tr key={crop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Leaf className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{crop.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {crop.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        {formatDate(crop.plantingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        {formatDate(crop.expectedHarvest)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Droplet className="h-4 w-4 text-blue-500 mr-1" />
                          Soil: {crop.soilType}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <SeedingIcon className="h-4 w-4 text-green-500 mr-1" />
                          Stage: {crop.growthStage}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(crop)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Edit2 className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(crop)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No crops found</p>
            <Button onClick={openAddModal}>Add your first crop</Button>
          </div>
        )}
      </div>
      
      {/* Add Crop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">Add New Crop</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onAddSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Crop Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    {...register('name', { required: 'Crop name is required' })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="type" className="form-label">
                    Crop Type
                  </label>
                  <select
                    id="type"
                    className="form-input"
                    {...register('type', { required: 'Crop type is required' })}
                  >
                    {cropTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plantingDate" className="form-label">
                      Planting Date
                    </label>
                    <input
                      id="plantingDate"
                      type="date"
                      className="form-input"
                      {...register('plantingDate', { required: 'Planting date is required' })}
                    />
                    {errors.plantingDate && (
                      <p className="form-error">{errors.plantingDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="expectedHarvest" className="form-label">
                      Expected Harvest
                    </label>
                    <input
                      id="expectedHarvest"
                      type="date"
                      className="form-input"
                      {...register('expectedHarvest', { required: 'Expected harvest date is required' })}
                    />
                    {errors.expectedHarvest && (
                      <p className="form-error">{errors.expectedHarvest.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="soilType" className="form-label">
                    Soil Type
                  </label>
                  <select
                    id="soilType"
                    className="form-input"
                    {...register('soilType', { required: 'Soil type is required' })}
                  >
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="growthStage" className="form-label">
                    Growth Stage
                  </label>
                  <select
                    id="growthStage"
                    className="form-input"
                    {...register('growthStage', { required: 'Growth stage is required' })}
                  >
                    {growthStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Add Crop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Crop Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">Edit Crop</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onEditSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Crop Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    {...register('name', { required: 'Crop name is required' })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="type" className="form-label">
                    Crop Type
                  </label>
                  <select
                    id="type"
                    className="form-input"
                    {...register('type', { required: 'Crop type is required' })}
                  >
                    {cropTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plantingDate" className="form-label">
                      Planting Date
                    </label>
                    <input
                      id="plantingDate"
                      type="date"
                      className="form-input"
                      {...register('plantingDate', { required: 'Planting date is required' })}
                    />
                    {errors.plantingDate && (
                      <p className="form-error">{errors.plantingDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="expectedHarvest" className="form-label">
                      Expected Harvest
                    </label>
                    <input
                      id="expectedHarvest"
                      type="date"
                      className="form-input"
                      {...register('expectedHarvest', { required: 'Expected harvest date is required' })}
                    />
                    {errors.expectedHarvest && (
                      <p className="form-error">{errors.expectedHarvest.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="soilType" className="form-label">
                    Soil Type
                  </label>
                  <select
                    id="soilType"
                    className="form-input"
                    {...register('soilType', { required: 'Soil type is required' })}
                  >
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="growthStage" className="form-label">
                    Growth Stage
                  </label>
                  <select
                    id="growthStage"
                    className="form-input"
                    {...register('growthStage', { required: 'Growth stage is required' })}
                  >
                    {growthStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Update Crop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Delete Crop</h3>
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{currentCrop?.name}</span>? This action cannot be undone.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  isLoading={isLoading}
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropManagement;