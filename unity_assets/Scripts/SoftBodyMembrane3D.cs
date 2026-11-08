using UnityEngine;
using System.Collections.Generic;

namespace MicroCraft.Biology
{
    /// <summary>
    /// SoftBodyMembrane3D:
    /// Real-time 3D deformable soft-body cell membrane using spring-mass physics,
    /// dynamic mesh vertex displacement, osmotic tonicity pressure, and cytolysis burst.
    /// </summary>
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    public class SoftBodyMembrane3D : MonoBehaviour
    {
        [Header("Membrane Dimensions")]
        public float baseRadius = 5.0f;
        public float currentRadius = 5.0f;
        public int latitudeSegments = 24;
        public int longitudeSegments = 24;

        [Header("Physical Parameters")]
        [Range(0.1f, 1.0f)] public float stiffness = 0.85f;
        [Range(0.8f, 0.99f)] public float damping = 0.98f;
        public float osmoticPressure = 290.0f; // mOsm (Isotonic: 290)

        [Header("Visual & Effects")]
        public Material membraneMaterial;
        public ParticleSystem cytolysisBurstParticles;

        private Mesh mesh;
        private Vector3[] originalVertices;
        private Vector3[] displacedVertices;
        private Vector3[] velocities;
        private bool isBurst = false;

        void Awake()
        {
            GenerateSphereMesh();
        }

        void GenerateSphereMesh()
        {
            mesh = new Mesh();
            mesh.name = "SoftBodyMembraneMesh";
            GetComponent<MeshFilter>().mesh = mesh;

            List<Vector3> verts = new List<Vector3>();
            List<int> tris = new List<int>();

            for (int lat = 0; lat <= latitudeSegments; lat++)
            {
                float theta = lat * Mathf.PI / latitudeSegments;
                float sinTheta = Mathf.Sin(theta);
                float cosTheta = Mathf.Cos(theta);

                for (int lon = 0; lon <= longitudeSegments; lon++)
                {
                    float phi = lon * 2 * Mathf.PI / longitudeSegments;
                    float sinPhi = Mathf.Sin(phi);
                    float cosPhi = Mathf.Cos(phi);

                    Vector3 pos = new Vector3(cosPhi * sinTheta, cosTheta, sinPhi * sinTheta) * baseRadius;
                    verts.Add(pos);
                }
            }

            for (int lat = 0; lat < latitudeSegments; lat++)
            {
                for (int lon = 0; lon < longitudeSegments; lon++)
                {
                    int first = (lat * (longitudeSegments + 1)) + lon;
                    int second = first + longitudeSegments + 1;

                    tris.Add(first);
                    tris.Add(second);
                    tris.Add(first + 1);

                    tris.Add(second);
                    tris.Add(second + 1);
                    tris.Add(first + 1);
                }
            }

            mesh.vertices = verts.ToArray();
            mesh.triangles = tris.ToArray();
            mesh.RecalculateNormals();

            originalVertices = mesh.vertices;
            displacedVertices = new Vector3[originalVertices.Length];
            velocities = new Vector3[originalVertices.Length];
            System.Array.Copy(originalVertices, displacedVertices, originalVertices.Length);
        }

        void Update()
        {
            if (isBurst) return;

            float dt = Time.deltaTime;
            float tonicityRatio = 290.0f / Mathf.Max(100.0f, osmoticPressure);
            float targetScale = Mathf.Clamp(tonicityRatio, 0.70f, 1.50f);
            currentRadius = baseRadius * targetScale;

            // Catastrophic cytolysis trigger
            if (targetScale > 1.45f || osmoticPressure > 420.0f)
            {
                TriggerCytolysis();
                return;
            }

            float time = Time.time;
            for (int i = 0; i < displacedVertices.Length; i++)
            {
                Vector3 orig = originalVertices[i];
                Vector3 target = orig.normalized * currentRadius;

                // Organic undulating breathing wave
                float wave = Mathf.Sin(orig.x * 1.5f + time * 2.0f) * Mathf.Cos(orig.z * 1.5f + time * 1.8f) * 0.15f;
                target += orig.normalized * wave;

                // Spring force toward target position
                Vector3 force = (target - displacedVertices[i]) * stiffness * 40.0f;
                velocities[i] = (velocities[i] + force * dt) * damping;
                displacedVertices[i] += velocities[i] * dt;
            }

            mesh.vertices = displacedVertices;
            mesh.RecalculateNormals();
        }

        public void DeformAt(Vector3 worldPoint, Vector3 displacement)
        {
            Vector3 localPoint = transform.InverseTransformPoint(worldPoint);
            for (int i = 0; i < displacedVertices.Length; i++)
            {
                float dist = Vector3.Distance(localPoint, displacedVertices[i]);
                if (dist < 2.0f)
                {
                    float factor = 1.0f - (dist / 2.0f);
                    velocities[i] += transform.InverseTransformDirection(displacement) * factor * 5.0f;
                }
            }
        }

        public void TriggerCytolysis()
        {
            isBurst = true;
            GetComponent<MeshRenderer>().enabled = false;
            if (cytolysisBurstParticles != null)
            {
                cytolysisBurstParticles.transform.position = transform.position;
                cytolysisBurstParticles.Play();
            }
        }

        public void ResetMembrane()
        {
            isBurst = false;
            GetComponent<MeshRenderer>().enabled = true;
            System.Array.Copy(originalVertices, displacedVertices, originalVertices.Length);
            for (int i = 0; i < velocities.Length; i++) velocities[i] = Vector3.zero;
            mesh.vertices = displacedVertices;
            mesh.RecalculateNormals();
        }
    }
}
