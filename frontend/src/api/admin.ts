// This file serves as a complete replacement for your 'api/admin.ts'
// It returns static data so you can see numbers immediately without a backend.
// Note: Adjusted import path to match file structure (frontend/src/types.ts is at ../types relative to frontend/src/api/admin.ts)
import type { RegionStatus } from '../types' 

// 1. Define the Types (if not already imported)
export interface AdminStats {
  total_parents: number
  total_children: number
  total_vaccinations: number
  completed_vaccinations: number
  overall_coverage_percent: number
  vaccines_by_group: { name: string; value: number }[]
  recent_registrations: number
}

export interface RegionData {
  id: number
  name: string
  population: number
  births: number
  coverage: number
  status: RegionStatus
  stock?: number
}

// 2. The Mock Function
// Replaces the original fetch call
export async function getAdminStats(): Promise<AdminStats> {
  // Simulate a short delay to feel like a real API
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    total_parents: 12,
    total_children: 18,
    total_vaccinations: 156,
    completed_vaccinations: 142,
    overall_coverage_percent: 91,
    recent_registrations: 3,
    vaccines_by_group: [
      { name: 'BCG', value: 32 },
      { name: 'DTC', value: 31 },
      { name: 'VPO', value: 31 },
      { name: 'ROR', value: 29 },
    ]
  };
}
