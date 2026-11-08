using UnityEngine;
using System.Collections.Generic;

namespace MicroCraft.Biology
{
    /// <summary>
    /// ImmuneSystemWarfare3D:
    /// Simulates viral attacks (Bacteriophage / Coronavirus) and host defense
    /// (Y-shaped antibodies agglutination & Macrophage phagocytosis) in Unity 3D.
    /// </summary>
    public class ImmuneSystemWarfare3D : MonoBehaviour
    {
        [Header("Prefabs")]
        public GameObject bacteriophagePrefab;
        public GameObject coronavirusPrefab;
        public GameObject antibodyPrefab;
        public GameObject macrophagePrefab;

        [Header("Pathogen State")]
        public float viralLoadInternal = 0f;
        public float lysisThreshold = 60f;
        public List<GameObject> activeVirions = new List<GameObject>();
        public List<GameObject> activeAntibodies = new List<GameObject>();

        public void SpawnVirion(Vector3 position, bool isPhage)
        {
            GameObject prefab = isPhage ? bacteriophagePrefab : coronavirusPrefab;
            if (prefab != null)
            {
                GameObject virion = Instantiate(prefab, position, Quaternion.identity, transform);
                activeVirions.Add(virion);
            }
        }

        public void EmitAntibodies(int count = 4)
        {
            if (antibodyPrefab == null) return;
            for (int i = 0; i < count; i++)
            {
                Vector3 pos = Random.insideUnitSphere * 4f;
                GameObject ab = Instantiate(antibodyPrefab, pos, Quaternion.identity, transform);
                activeAntibodies.Add(ab);
            }
        }

        void Update()
        {
            // Internal replication if hijacked
            if (viralLoadInternal > 0)
            {
                viralLoadInternal += Time.deltaTime * (1.2f + viralLoadInternal * 0.05f);
                if (viralLoadInternal >= lysisThreshold)
                {
                    // Lysis explosion in Unity
                    SoftBodyMembrane3D membrane = FindObjectOfType<SoftBodyMembrane3D>();
                    if (membrane != null) membrane.TriggerCytolysis();
                    viralLoadInternal = 0;
                }
            }
        }
    }
}
