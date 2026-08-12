import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { theme } from "../../../constants/theme";
import {
  getJobById,
  resolveJobImageUrl,
} from "../../../src/services/jobs";
import { applyToJob } from "../../../src/services/applications";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<any>(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);

        const data = await getJobById(String(id));

        const resolvedJob =
          data?.job ??
          data?.data ??
          data;

        setJob(resolvedJob);
      } catch (error: any) {
        Alert.alert(
          "Erreur",
          error?.response?.data?.message ||
            error?.message ||
            "Impossible de charger l’offre."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        return;
      }

      setCvFile(file);
    } catch {
      Alert.alert(
        "Erreur",
        "Impossible de sélectionner le CV."
      );
    }
  };

  const removeCV = () => {
    setCvFile(null);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModal(false);
  };

  const onApply = async () => {
    try {
      setSubmitting(true);

      await applyToJob(
        String(id),
        message.trim(),
        cvFile
      );

      setModal(false);
      setMessage("");
      setCvFile(null);
      Keyboard.dismiss();

      Alert.alert(
        "Succès",
        "Ta candidature a été envoyée."
      );
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          error?.message ||
          "Impossible de postuler."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Offre introuvable.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = resolveJobImageUrl(job?.imageUrl);

  const description = String(
    job?.description || ""
  ).trim();

  const requirements = String(
    job?.requirements || ""
  ).trim();

  const benefits = String(
    job?.benefits || ""
  ).trim();

  const duration = String(
    job?.duration || ""
  ).trim();

  const salary = String(
    job?.salary || ""
  ).trim();

  const workMode = String(
    job?.workMode || ""
  ).trim();

  const experienceLevel = String(
    job?.experienceLevel || ""
  ).trim();

  const skills = Array.isArray(job?.skills)
    ? job.skills.filter(Boolean)
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Feather
              name="chevron-left"
              size={20}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>
            {job.title}
          </Text>

          <Text style={styles.company}>
            {job?.company?.companyName || "Entreprise"}
          </Text>

          <View style={styles.metaRow}>
            {!!job.contractType && (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>
                  {job.contractType}
                </Text>
              </View>
            )}

            {!!workMode && (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>
                  {workMode}
                </Text>
              </View>
            )}

            {job.isPaid ? (
              <View
                style={[
                  styles.metaPill,
                  styles.greenPill,
                ]}
              >
                <Text
                  style={[
                    styles.metaText,
                    styles.greenText,
                  ]}
                >
                  Rémunéré
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {!!imageUrl && (
          <JobFlyer imageUrl={imageUrl} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Détails
          </Text>

          <DetailRow
            icon="map-pin"
            label="Ville"
            value={job.city || "Non précisée"}
          />

          <DetailRow
            icon="briefcase"
            label="Domaine"
            value={job.domain || "Non précisé"}
          />

          {!!workMode && (
            <DetailRow
              icon="monitor"
              label="Mode de travail"
              value={workMode}
            />
          )}

          {!!duration && (
            <DetailRow
              icon="clock"
              label="Durée"
              value={duration}
            />
          )}

          <DetailRow
            icon="dollar-sign"
            label="Rémunération"
            value={
              job.isPaid
                ? salary || "Non précisée"
                : "Non rémunérée"
            }
          />

          {!!job.deadline && (
            <DetailRow
              icon="calendar"
              label="Date limite"
              value={new Date(
                job.deadline
              ).toLocaleDateString("fr-FR")}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.desc}>
            {description || "Description non renseignée."}
          </Text>
        </View>

        {skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Feather
                name="cpu"
                size={18}
                color={theme.colors.primary}
              />

              <Text style={styles.sectionHeadingText}>
                Compétences recherchées
              </Text>
            </View>

            <View style={styles.skillsWrap}>
              {skills.map(
                (
                  skill: string,
                  index: number
                ) => (
                  <View
                    key={`${skill}-${index}`}
                    style={styles.skillChip}
                  >
                    <Text style={styles.skillChipText}>
                      {skill}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {!!requirements && (
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Feather
                name="check-square"
                size={18}
                color={theme.colors.primary}
              />

              <Text style={styles.sectionHeadingText}>
                Exigences
              </Text>
            </View>

            <Text style={styles.desc}>
              {requirements}
            </Text>
          </View>
        )}

        {!!benefits && (
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Feather
                name="gift"
                size={18}
                color={theme.colors.success}
              />

              <Text style={styles.sectionHeadingText}>
                Avantages
              </Text>
            </View>

            <Text style={styles.desc}>
              {benefits}
            </Text>
          </View>
        )}

        <Pressable
          style={styles.applyBtn}
          onPress={() => setModal(true)}
        >
          <Feather
            name="send"
            size={18}
            color="#fff"
          />

          <Text style={styles.applyBtnText}>
            Postuler
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={
                Platform.OS === "ios"
                  ? "padding"
                  : undefined
              }
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Candidater
                  </Text>

                  <Pressable
                    onPress={closeModal}
                    style={styles.closeBtn}
                  >
                    <Feather
                      name="x"
                      size={18}
                      color={theme.colors.text}
                    />
                  </Pressable>
                </View>

                <Text style={styles.modalSub}>
                  Ajoute un message et ton CV avant d’envoyer.
                </Text>

                <Text style={styles.label}>
                  Message à l’entreprise
                </Text>

                <TextInput
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Ex : Bonjour, je suis très intéressé par cette opportunité..."
                  placeholderTextColor={theme.colors.faint}
                  style={styles.textarea}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />

                <Text style={styles.label}>
                  CV
                </Text>

                {!cvFile ? (
                  <Pressable
                    style={styles.uploadBtn}
                    onPress={pickCV}
                  >
                    <Feather
                      name="upload"
                      size={18}
                      color={theme.colors.primary}
                    />

                    <Text style={styles.uploadBtnText}>
                      Ajouter mon CV
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.fileCard}>
                    <View style={styles.fileLeft}>
                      <Feather
                        name="file-text"
                        size={18}
                        color={theme.colors.primary}
                      />

                      <Text
                        style={styles.fileName}
                        numberOfLines={1}
                      >
                        {cvFile.name}
                      </Text>
                    </View>

                    <Pressable onPress={removeCV}>
                      <Feather
                        name="trash-2"
                        size={18}
                        color={theme.colors.danger}
                      />
                    </Pressable>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelText}>
                      Fermer
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.sendBtn,
                      submitting && styles.sendBtnDisabled,
                    ]}
                    onPress={onApply}
                    disabled={submitting}
                  >
                    <Text style={styles.sendText}>
                      {submitting ? "Envoi..." : "Envoyer"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

function JobFlyer({
  imageUrl,
}: {
  imageUrl: string;
}) {
  /*
   * Ratio largeur / hauteur.
   * 0,70 correspond à un flyer vertical par défaut.
   */
  const [aspectRatio, setAspectRatio] = useState(0.7);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    Image.getSize(
      imageUrl,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        /*
         * En cas d’échec de lecture des dimensions,
         * on conserve un format vertical.
         */
        setAspectRatio(0.7);
      }
    );
  }, [imageUrl]);

  return (
    <View style={styles.flyerCard}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.flyerImage,
          {
            aspectRatio,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather
          name={icon}
          size={16}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: theme.colors.muted,
    fontWeight: "700",
  },

  container: {
    padding: 16,
    paddingBottom: 120,
  },

  topBar: {
    marginBottom: 8,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  hero: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
  },

  company: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.muted,
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },

  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.text,
  },

  greenPill: {
    backgroundColor: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.22)",
  },

  greenText: {
    color: theme.colors.success,
  },

  /*
   * Le conteneur prend la hauteur calculée
   * automatiquement par le ratio de l’image.
   */
  flyerCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * Aucune hauteur fixe.
   * La hauteur dépend de aspectRatio.
   */
  flyerImage: {
    width: "100%",
    height: undefined,
    backgroundColor: "#F8FAFC",
  },

  section: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
    marginBottom: 14,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  sectionHeadingText: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: theme.colors.faint,
    fontSize: 11.5,
    fontWeight: "700",
  },

  detailValue: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  desc: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text,
    fontWeight: "600",
  },

  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E6FF",
  },

  skillChipText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "800",
  },

  applyBtn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  applyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.22)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  modalSub: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.muted,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
  },

  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },

  textarea: {
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.surface2,
    padding: 14,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 16,
  },

  uploadBtn: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(59,130,246,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  uploadBtnText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },

  fileCard: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },

  fileName: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: "700",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: theme.colors.text,
    fontWeight: "800",
  },

  sendBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  sendBtnDisabled: {
    opacity: 0.6,
  },

  sendText: {
    color: "#fff",
    fontWeight: "900",
  },
});