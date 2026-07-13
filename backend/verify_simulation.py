import sys
from simulator import SafetySimulator

def run_tests():
    print("=== SAFETYAI V2.0 SIMULATOR TEST SUITE ===")
    
    # Initialize simulator
    sim = SafetySimulator()
    print("1. Initializing simulator...")
    state = sim.get_serializable_state()
    
    # Verify initial conditions
    assert state["scenario"] == "NORMAL", "Default scenario should be NORMAL"
    assert state["risk_level"] == "SAFE", "Default risk level should be SAFE"
    assert state["overall_risk_score"] == 18, "Default risk score should be 18"
    assert len(state["zones"]) == 8, "Should have 8 zones"
    print("   [OK] Initial conditions valid.")

    # Test Case A: CO Leak Operational Drift
    print("2. Testing Coke Oven Gas Leak (CO) - Operational Drift...")
    sim.trigger_scenario("CO_LEAK", "OPERATIONAL_DRIFT")
    assert sim.scenario == "CO_LEAK"
    assert sim.preset == "OPERATIONAL_DRIFT"
    
    for _ in range(12):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "WATCH"
    assert state["prediction_breach"]["time_offset"] == 33
    
    for _ in range(10):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "PREPARE"
    
    for _ in range(10):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "ACT"
    assert state["awaiting_approval"] == True
    
    sim.approve_plan()
    
    for _ in range(16):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "RECOVERY"
    
    for _ in range(10):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "CLOSED"
    print("   [OK] Coke Oven Gas Leak tests passed.")

    # Test Case B: Ammonia Leak
    print("3. Testing Ammonia Leak (NH3) - Critical Escalation...")
    sim.reset()
    sim.trigger_scenario("AMMONIA_LEAK", "CRITICAL_ESCALATION")
    assert sim.scenario_config["sensor_name"] == "NH3"
    assert sim.scenario_config["affected_zone"] == "Z-07"
    assert sim.scenario_config["safety_threshold"] == 25.0
    
    for _ in range(12):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "WATCH"
    assert state["prediction_breach"]["time_offset"] == 21
    print("   [OK] Ammonia Leak tests passed.")

    # Test Case C: Conveyor Fire
    print("4. Testing Conveyor Overheat Fire (Temp)...")
    sim.reset()
    sim.trigger_scenario("CONVEYOR_FIRE", "OPERATIONAL_DRIFT")
    assert sim.scenario_config["sensor_name"] == "Temp"
    assert sim.scenario_config["affected_zone"] == "Z-04"
    assert sim.scenario_config["safety_threshold"] == 80.0
    
    for _ in range(12):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "WATCH"
    print("   [OK] Conveyor Overheat Fire tests passed.")

    # Test Case D: Boiler Overpressure
    print("5. Testing Boiler Overpressure (Pressure)...")
    sim.reset()
    sim.trigger_scenario("BOILER_OVERPRESSURE", "CRITICAL_ESCALATION")
    assert sim.scenario_config["sensor_name"] == "Pressure"
    assert sim.scenario_config["affected_zone"] == "Z-02"
    assert sim.scenario_config["safety_threshold"] == 15.0
    
    for _ in range(12):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "WATCH"
    print("   [OK] Boiler Overpressure tests passed.")

    # Test Case E: Oxygen Deficiency
    print("6. Testing Oxygen Deficiency (O2) Confined Space Drop...")
    sim.reset()
    sim.trigger_scenario("CONFINED_SPACE", "OPERATIONAL_DRIFT")
    assert sim.scenario_config["sensor_name"] == "O2"
    assert sim.scenario_config["affected_zone"] == "Z-03"
    assert sim.scenario_config["safety_threshold"] == 19.5
    assert sim.scenario_config["direction"] == "down"
    
    # Verify O2 values drop below baseline 20.9%
    for _ in range(12):
        sim.update_ticks()
    state = sim.get_serializable_state()
    assert state["risk_level"] == "WATCH"
    assert state["zones"]["Z-03"]["co_level"] < 20.9, "O2 level should decrease below baseline"
    print("   [OK] Oxygen Deficiency tests passed.")

    print("\n=== ALL TEST CASES COMPLETED: 100% PASS SUCCESS ===")

if __name__ == "__main__":
    run_tests()
