using UnityEngine;

namespace MicroCraft.Biology
{
    /// <summary>
    /// CellularRespiration3D:
    /// Simulates C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + 36-38 ATP in Unity 3D,
    /// driving the visual rotation of the F0/F1 ATP Synthase rotor turbine.
    /// </summary>
    public class CellularRespiration3D : MonoBehaviour
    {
        [Header("Substrates & Products")]
        public float glucose = 95.0f; // mg/dL
        public float oxygen = 85.0f;  // %
        public float atp = 100.0f;    // ATP pool
        public float adp = 40.0f;     // ADP pool
        public float protonGradient = 80.0f; // % (ΔΨ)
        public float intracellularPh = 7.40f;
        public float lacticAcid = 0.8f;
        public float atpSynthaseRpm = 3600f;

        [Header("3D Visual Transform")]
        public Transform atpSynthaseRotor;
        public ParticleSystem atpSparksParticles;

        void Update()
        {
            float dt = Time.deltaTime;

            // 1. Glycolysis: Glucose -> Pyruvate + 2 ATP
            float glucoseConsumed = Mathf.Min(glucose, 1.5f * dt);
            if (glucoseConsumed > 0)
            {
                glucose -= glucoseConsumed;
                atp += glucoseConsumed * 2.0f;
            }

            // 2. Aerobic Respiration vs Hypoxic Fermentation
            if (oxygen > 18.0f)
            {
                float oxygenConsumed = Mathf.Min(oxygen, 2.0f * dt);
                oxygen -= oxygenConsumed;
                protonGradient = Mathf.Min(100.0f, protonGradient + oxygenConsumed * 3.5f);
                if (lacticAcid > 0.5f) lacticAcid -= 0.8f * dt;
            }
            else
            {
                // Hypoxia -> Lactic Acid buildup -> Acidosis
                lacticAcid += glucoseConsumed * 3.0f;
                protonGradient = Mathf.Max(5.0f, protonGradient - 4.0f * dt);
            }

            // 3. ATP Synthase Turbine Rotor (F0/F1)
            if (protonGradient > 20.0f && adp > 2.0f)
            {
                float gradientFlow = protonGradient / 100.0f;
                atpSynthaseRpm = gradientFlow * 6000f;

                float oxidativeAtp = gradientFlow * 4.5f * dt;
                atp += oxidativeAtp;
                adp = Mathf.Max(0, adp - oxidativeAtp * 0.4f);
                protonGradient = Mathf.Max(10f, protonGradient - oxidativeAtp * 1.2f);
            }
            else
            {
                atpSynthaseRpm = Mathf.Lerp(atpSynthaseRpm, 0, dt * 2.0f);
            }

            // Spin 3D Rotor
            if (atpSynthaseRotor != null)
            {
                atpSynthaseRotor.Rotate(Vector3.up, (atpSynthaseRpm / 60f) * 360f * dt, Space.Self);
            }

            // Intracellular pH buffering
            float targetPh = 7.42f - (lacticAcid * 0.08f);
            intracellularPh = Mathf.Lerp(intracellularPh, targetPh, dt * 0.05f);

            // Basal ATP Consumption
            atp = Mathf.Max(0, atp - 1.2f * dt);
        }

        public void InjectGlucose(float amount = 30f) => glucose = Mathf.Min(200f, glucose + amount);
        public void InjectOxygen(float amount = 25f) => oxygen = Mathf.Min(100f, oxygen + amount);
    }
}
