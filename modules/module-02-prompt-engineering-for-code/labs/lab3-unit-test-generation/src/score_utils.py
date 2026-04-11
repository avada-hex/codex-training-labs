"""Utility helpers for the scoring lab."""

def calculate_final_score(base_score: float, bonus_pct: float, penalty: float) -> float:
    """Return the final game score after applying a percentage bonus and a fixed penalty."""
    bonus_amount = base_score * bonus_pct / 100
    final = base_score + bonus_amount - penalty
    return round(final, 2)

def is_eligible_for_reward(score: float, threshold: float = 75.0) -> bool:
    """Check whether a participant meets the minimum threshold for a reward."""
    return score >= threshold
