import pytest

from src.score_utils import calculate_final_score, is_eligible_for_reward


def test_calculate_final_score_applies_bonus_and_penalty():
    result = calculate_final_score(base_score=80, bonus_pct=25, penalty=5)
    assert result == 95.0


def test_calculate_final_score_rounds_to_two_decimals():
    result = calculate_final_score(base_score=81, bonus_pct=17.5, penalty=3.2)
    assert result == pytest.approx(95.35)


def test_is_eligible_for_reward_defaults_threshold():
    assert is_eligible_for_reward(score=75.0)


def test_is_eligible_for_reward_fails_when_score_is_lower():
    assert not is_eligible_for_reward(score=74.999)
