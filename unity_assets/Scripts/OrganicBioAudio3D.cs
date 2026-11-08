using UnityEngine;

namespace MicroCraft.Biology
{
    /// <summary>
    /// OrganicBioAudio3D:
    /// Procedural audio synthesis in Unity using OnAudioFilterRead
    /// for squishy collisions, ATP bells, and lysis noise bursts without external MP3 files.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class OrganicBioAudio3D : MonoBehaviour
    {
        private AudioSource audioSource;
        private double phase = 0.0;
        private int sampleRate = 44100;
        public float frequency = 55.0f; // Cytoplasmic binaural drone
        public float gain = 0.05f;

        void Awake()
        {
            audioSource = GetComponent<AudioSource>();
            audioSource.playOnAwake = true;
            audioSource.loop = true;
            sampleRate = AudioSettings.outputSampleRate;
        }

        void OnAudioFilterRead(float[] data, int channels)
        {
            double phaseIncrement = frequency * 2.0 * System.Math.PI / sampleRate;
            for (int i = 0; i < data.Length; i += channels)
            {
                phase += phaseIncrement;
                float sample = (float)System.Math.Sin(phase) * gain;
                for (int c = 0; c < channels; c++)
                {
                    data[i + c] += sample;
                }
            }
        }
    }
}
