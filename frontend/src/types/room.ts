/**
 * Interfejs reprezentujący salę konferencyjną.
 */
export interface Room {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  floor: string | null;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dane do utworzenia nowej sali.
 */
export interface CreateRoomData {
  name: string;
  description?: string;
  capacity: number;
  floor?: string;
  amenities?: string[];
}

/**
 * Dane do aktualizacji sali.
 */
export interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}
