export interface League {
  league_id: string
  name: string
  country: string
}

export interface Season {
  season_id: string
  start_date: string
  end_date: string
}

export interface LeagueSeason {
  league_id: string
  season_id: string
  total_matches: number
}

export interface Team {
  team_id: string
  name: string
  city: string
  country: string
  stadium: string
  capacity: number
  founded: number
}

export interface TeamSeason {
  team_id: string
  league_id: string
  season_id: string
}

export interface Match {
  match_id: string
  date: string
  league_id: string
  season_id: string
  home_team_id: string
  away_team_id: string
  home_team: string
  away_team: string
  home_city: string
  away_city: string
  stadium: string
  country: string
}

export interface Airport {
  team_id: string
  iata_code: string
  airport_name: string
  latitude: number
  longitude: number
}

