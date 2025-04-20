import { Suspense } from 'react';
import StaffList from '@/app/components/StaffList';
import StaffAvailability from '@/app/components/StaffAvailability';
import PageTitle from '@/app/components/PageTitle';
import SalonLayout from '@/app/components/SalonLayout';

export const metadata = {
  title: 'Staff Management | Salon Dashboard',
  description: 'Manage your salon staff members',
};

export default function StaffPage() {
  return (
    <SalonLayout currentPage="staff">
      <div className="container mx-auto px-4 py-8">
        <PageTitle 
          title="Staff Management" 
          description="Add, edit, and manage your salon staff members"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <div className="mt-8">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <StaffList />
          </Suspense>
        </div>

        <div className="mt-12 border-t pt-8">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <StaffAvailability />
          </Suspense>
        </div>
      </div>
    </SalonLayout>
  );
} 
