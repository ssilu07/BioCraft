using UnityEngine;
using System.Collections.Generic;

namespace MicroCraft.Biology
{
    /// <summary>
    /// CentralDogmaRibosome3D:
    /// 64-codon dictionary, mRNA translation, and 3D phenotypic protein synthesis.
    /// </summary>
    public class CentralDogmaRibosome3D : MonoBehaviour
    {
        public static readonly Dictionary<string, string> GeneticCode = new Dictionary<string, string>()
        {
            {"UUU", "Phe"}, {"UUC", "Phe"}, {"UUA", "Leu"}, {"UUG", "Leu"},
            {"UCU", "Ser"}, {"UCC", "Ser"}, {"UCA", "Ser"}, {"UCG", "Ser"},
            {"UAU", "Tyr"}, {"UAC", "Tyr"}, {"UAA", "STOP"}, {"UAG", "STOP"},
            {"UGU", "Cys"}, {"UGC", "Cys"}, {"UGA", "STOP"}, {"UGG", "Trp"},
            {"CUU", "Leu"}, {"CUC", "Leu"}, {"CUA", "Leu"}, {"CUG", "Leu"},
            {"CCU", "Pro"}, {"CCC", "Pro"}, {"CCA", "Pro"}, {"CCG", "Pro"},
            {"CAU", "His"}, {"CAC", "His"}, {"CAA", "Gln"}, {"CAG", "Gln"},
            {"CGU", "Arg"}, {"CGC", "Arg"}, {"CGA", "Arg"}, {"CGG", "Arg"},
            {"AUU", "Ile"}, {"AUC", "Ile"}, {"AUA", "Ile"}, {"AUG", "Met"},
            {"ACU", "Thr"}, {"ACC", "Thr"}, {"ACA", "Thr"}, {"ACG", "Thr"},
            {"AAU", "Asn"}, {"AAC", "Asn"}, {"AAA", "Lys"}, {"AAG", "Lys"},
            {"AGU", "Ser"}, {"AGC", "Ser"}, {"AGA", "Arg"}, {"AGG", "Arg"},
            {"GUU", "Val"}, {"GUC", "Val"}, {"GUA", "Val"}, {"GUG", "Val"},
            {"GCU", "Ala"}, {"GCC", "Ala"}, {"GCA", "Ala"}, {"GCG", "Ala"},
            {"GAU", "Asp"}, {"GAC", "Asp"}, {"GAA", "Glu"}, {"GAG", "Glu"},
            {"GGU", "Gly"}, {"GGC", "Gly"}, {"GGA", "Gly"}, {"GGG", "Gly"}
        };

        [Header("Genetic Sequences")]
        public string currentMRna = "AUGUCGAAAGGCGAAGAGUUGUAA"; // GFP transcript
        public List<string> translatedPeptide = new List<string>();

        [Header("3D Phenotype Visuals")]
        public Light gfpBioluminescentLight;
        public GameObject flagellumObject;
        public bool isGfpActive = false;
        public bool isFlagellinActive = false;
        public bool isSickleCell = false;

        public void TranslateCurrentMRna()
        {
            translatedPeptide.Clear();
            bool reading = false;

            for (int i = 0; i + 3 <= currentMRna.Length; i += 3)
            {
                string codon = currentMRna.Substring(i, 3).ToUpper();
                if (codon == "AUG") reading = true;

                if (reading)
                {
                    if (GeneticCode.TryGetValue(codon, out string aa))
                    {
                        if (aa == "STOP") break;
                        translatedPeptide.Add(aa);
                    }
                }
            }

            // Phenotype impact
            isGfpActive = translatedPeptide.Count >= 6 && translatedPeptide.Contains("Gly");
            isFlagellinActive = translatedPeptide.Count >= 6 && translatedPeptide.Contains("Ala");
            isSickleCell = translatedPeptide.Count >= 6 && translatedPeptide[5] == "Val";

            if (gfpBioluminescentLight != null)
                gfpBioluminescentLight.enabled = isGfpActive;

            if (flagellumObject != null)
                flagellumObject.SetActive(isFlagellinActive);
        }
    }
}
