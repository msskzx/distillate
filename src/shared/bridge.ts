import type {
  Card,
  CardStatus,
  CreateCardInput,
  CreateCardResult,
  ListCardsFilters,
  UpdateCardInput,
} from './cards'

export interface DistillateApi {
  preferences: {
    getLaunchAtStartup(): Promise<boolean>
    setLaunchAtStartup(enabled: boolean): Promise<boolean>
  }
  cards: {
    list(filters?: ListCardsFilters): Promise<Card[]>
    get(id: string): Promise<Card | null>
    create(input: CreateCardInput): Promise<CreateCardResult>
    update(id: string, input: UpdateCardInput): Promise<Card>
    setStatus(id: string, status: CardStatus): Promise<Card>
    setFavorite(id: string, favorite: boolean): Promise<Card>
    delete(id: string): Promise<boolean>
    projects(): Promise<string[]>
  }
}
