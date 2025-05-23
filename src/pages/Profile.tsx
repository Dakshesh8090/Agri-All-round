import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    },
  });
  
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();
  
  const newPassword = watchPassword('newPassword');
  
  const onProfileSubmit = async (data: ProfileForm) => {
    // In a real app, this would make an API call
    setTimeout(() => {
      updateUser({ name: data.name, email: data.email });
      setProfileUpdateSuccess(true);
      setIsEditingProfile(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setProfileUpdateSuccess(false), 3000);
    }, 1000);
  };
  
  const onPasswordSubmit = async (data: PasswordForm) => {
    // In a real app, this would make an API call
    setTimeout(() => {
      setPasswordUpdateSuccess(true);
      setIsChangingPassword(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setPasswordUpdateSuccess(false), 3000);
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-primary-100 mt-1">Manage your account information and settings</p>
        </div>
        
        {/* Profile Information */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            {!isEditingProfile && (
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          {profileUpdateSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Profile updated successfully!
            </div>
          )}
          
          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    {...registerProfile('name', { required: 'Name is required' })}
                  />
                  {profileErrors.name && (
                    <p className="form-error">{profileErrors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email',
                      },
                    })}
                  />
                  {profileErrors.email && (
                    <p className="form-error">{profileErrors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="form-label flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number (optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    {...registerProfile('phone')}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex border-b pb-4">
                <div className="w-1/3 font-medium text-gray-500 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </div>
                <div className="w-2/3 text-gray-900">{user?.name}</div>
              </div>
              <div className="flex border-b pb-4">
                <div className="w-1/3 font-medium text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </div>
                <div className="w-2/3 text-gray-900">{user?.email}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-medium text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </div>
                <div className="w-2/3 text-gray-900">Not provided</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Password Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Password</h2>
            {!isChangingPassword && (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            )}
          </div>
          
          {passwordUpdateSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Password updated successfully!
            </div>
          )}
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="form-label flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="form-input"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                    })}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="form-error">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="form-label flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-input"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                  {passwordErrors.newPassword && (
                    <p className="form-error">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="form-label flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'The passwords do not match',
                    })}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Password
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center text-gray-500">
              <Lock className="w-5 h-5 mr-2" />
              Your password was last changed on <span className="ml-1 text-gray-700">January 15, 2025</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Account Preferences */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Account Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive emails about crop alerts and weather updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-gray-500">Receive text messages for critical weather alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Data Sharing</p>
                <p className="text-sm text-gray-500">Share anonymized crop data to improve AI recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-md font-semibold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="danger">Delete Account</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;