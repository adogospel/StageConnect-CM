import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { theme } from "../../constants/theme";
import {
  createJob,
  ContractType,
  WorkMode,
} from "../../src/services/jobs";

type FormState = {
  title: string;
  city: string;
  domain: string;
  contractType: ContractType;
  workMode: WorkMode;
  duration: string;
  salary: string;
  deadline: string;
  requirements: string;
  benefits: string;
  description: string;
  isPaid: boolean;
};

const CONTRACT_TYPES: ContractType[] = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Temps partiel",
];

const WORK_MODES: WorkMode[] = [
  "Présentiel",
  "Hybride",
  "Remote",
];

const CONTRACT_TYPES_WITH_DURATION: ContractType[] = [
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Temps partiel",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_IMAGE_EXTENSIONS =
  /\.(jpg|jpeg|png|webp|gif)$/i;

function formatFileSize(size?: number | null) {
  if (!size) {
    return "";
  }

  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

function getDefaultFileName(
  asset: ImagePicker.ImagePickerAsset
) {
  if (asset.fileName) {
    return asset.fileName;
  }

  const mimeType = asset.mimeType || "";

  if (mimeType === "image/png") {
    return `flyer-${Date.now()}.png`;
  }

  if (mimeType === "image/webp") {
    return `flyer-${Date.now()}.webp`;
  }

  if (mimeType === "image/gif") {
    return `flyer-${Date.now()}.gif`;
  }

  return `flyer-${Date.now()}.jpg`;
}

export default function CreateJobScreen() {
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    city: "",
    domain: "",
    contractType: "CDI",
    workMode: "Présentiel",
    duration: "",
    salary: "",
    deadline: "",
    requirements: "",
    benefits: "",
    description: "",
    isPaid: false,
  });

  const durationEnabled =
    CONTRACT_TYPES_WITH_DURATION.includes(
      form.contractType
    );

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const changeContractType = (
    contractType: ContractType
  ) => {
    setForm((previous) => ({
      ...previous,
      contractType,
      duration: CONTRACT_TYPES_WITH_DURATION.includes(
        contractType
      )
        ? previous.duration
        : "",
    }));
  };

  const errors = useMemo(() => {
    const result: Partial<
      Record<keyof FormState, string>
    > = {};

    if (!form.title.trim()) {
      result.title = "Le titre est requis.";
    }

    if (!form.city.trim()) {
      result.city = "La ville est requise.";
    }

    if (!form.domain.trim()) {
      result.domain = "Le domaine est requis.";
    }

    if (!form.description.trim()) {
      result.description =
        "La description est requise.";
    }

    if (form.deadline.trim()) {
      const validFormat =
        /^\d{4}-\d{2}-\d{2}$/.test(
          form.deadline.trim()
        );

      if (!validFormat) {
        result.deadline =
          "Format attendu : YYYY-MM-DD";
      }
    }

    return result;
  }, [form]);

  const canSubmit = Boolean(
    form.title.trim() &&
      form.city.trim() &&
      form.domain.trim() &&
      form.contractType &&
      form.description.trim() &&
      !errors.deadline
  );

  const pickJobImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission nécessaire",
            "Autorise l’accès à la galerie pour sélectionner le flyer."
          );
          return;
        }
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.9,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset) {
        return;
      }

      const fileName = getDefaultFileName(asset);
      const mimeType = asset.mimeType || "";

      const validMimeType =
        !mimeType ||
        ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);

      const validExtension =
        ALLOWED_IMAGE_EXTENSIONS.test(fileName);

      if (!validMimeType || !validExtension) {
        Alert.alert(
          "Format non accepté",
          "Utilise une image JPG, JPEG, PNG, WEBP ou GIF."
        );
        return;
      }

      if (
        asset.fileSize &&
        asset.fileSize > MAX_IMAGE_SIZE
      ) {
        Alert.alert(
          "Image trop lourde",
          "Le flyer ne doit pas dépasser 5 Mo."
        );
        return;
      }

      setSelectedImage({
        ...asset,
        fileName,
      });
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de sélectionner l’image."
      );
    }
  };

  const removeJobImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        "Formulaire incomplet",
        "Renseigne le titre, la ville, le domaine, le type de contrat et la description."
      );
      return;
    }

    try {
      setLoading(true);

      await createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        domain: form.domain.trim(),

        contractType: form.contractType,
        workMode: form.workMode,

        duration: durationEnabled
          ? form.duration.trim()
          : "",

        salary: form.isPaid
          ? form.salary.trim()
          : "",

        isPaid: form.isPaid,

        requirements:
          form.requirements.trim(),

        benefits: form.benefits.trim(),

        deadline: form.deadline.trim(),

        image: selectedImage
          ? {
              uri: selectedImage.uri,
              fileName:
                selectedImage.fileName ||
                getDefaultFileName(selectedImage),
              name:
                selectedImage.fileName ||
                getDefaultFileName(selectedImage),
              mimeType:
                selectedImage.mimeType ||
                "image/jpeg",
              fileSize:
                selectedImage.fileSize,
            }
          : null,
      });

      Alert.alert(
        "Succès",
        "Offre publiée avec succès.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/(company-tabs)/publications"
              ),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          error?.message ||
          "Impossible de publier l’offre."
      );
    } finally {
      setLoading(false);
    }
  };

  const ChipGroup = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (value: any) => void;
  }) => (
    <View style={styles.chipsWrap}>
      {options.map((option) => {
        const active = value === option;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              active && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                active && styles.chipTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Feather
                name="chevron-left"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <View style={styles.topBarCenter}>
              <Text style={styles.pageTitle}>
                Publier une offre
              </Text>

              <Text style={styles.pageSubTitle}>
                Emploi ou stage, avec toutes les
                informations utiles.
              </Text>
            </View>

            <View style={styles.iconGhost} />
          </View>

          <View style={styles.card}>
            <SectionTitle title="Informations principales" />

            <LabeledInput
              label="Titre du poste"
              value={form.title}
              onChangeText={(value) =>
                updateField("title", value)
              }
              placeholder="Ex : Développeur Frontend React"
              error={errors.title}
            />

            <LabeledInput
              label="Ville"
              value={form.city}
              onChangeText={(value) =>
                updateField("city", value)
              }
              placeholder="Ex : Douala"
              error={errors.city}
            />

            <LabeledInput
              label="Domaine"
              value={form.domain}
              onChangeText={(value) =>
                updateField("domain", value)
              }
              placeholder="Ex : Informatique"
              error={errors.domain}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>
                Type de contrat
              </Text>

              <ChipGroup
                options={CONTRACT_TYPES}
                value={form.contractType}
                onChange={changeContractType}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>
                Mode de travail
              </Text>

              <ChipGroup
                options={WORK_MODES}
                value={form.workMode}
                onChange={(value) =>
                  updateField("workMode", value)
                }
              />
            </View>
          </View>

          <View style={styles.card}>
            <SectionTitle title="Conditions" />

            <LabeledInput
              label="Durée — optionnel"
              value={form.duration}
              onChangeText={(value) =>
                updateField("duration", value)
              }
              placeholder={
                durationEnabled
                  ? "Ex : 6 mois"
                  : "Non applicable pour ce contrat"
              }
              editable={durationEnabled}
              hint={
                durationEnabled
                  ? "La durée peut être précisée pour ce type de contrat."
                  : "La durée est activée pour CDD, Stage, Alternance, Freelance et Temps partiel."
              }
            />

            <LabeledInput
              label="Date limite — optionnel"
              value={form.deadline}
              onChangeText={(value) =>
                updateField("deadline", value)
              }
              placeholder="YYYY-MM-DD"
              error={errors.deadline}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.label}>
                  Offre rémunérée
                </Text>

                <Text style={styles.hint}>
                  Active cette option pour préciser la
                  rémunération.
                </Text>
              </View>

              <Switch
                value={form.isPaid}
                onValueChange={(value) => {
                  updateField("isPaid", value);

                  if (!value) {
                    updateField("salary", "");
                  }
                }}
                trackColor={{
                  false: "#D8E1EE",
                  true: "#93C5FD",
                }}
                thumbColor={
                  form.isPaid
                    ? theme.colors.primary
                    : "#fff"
                }
              />
            </View>

            <LabeledInput
              label="Rémunération"
              value={form.salary}
              onChangeText={(value) =>
                updateField("salary", value)
              }
              placeholder="Ex : 150 000 FCFA"
              editable={form.isPaid}
            />
          </View>

          <View style={styles.card}>
            <SectionTitle title="Flyer de l’offre — optionnel" />

            {!selectedImage ? (
              <Pressable
                style={styles.imagePicker}
                onPress={pickJobImage}
              >
                <View style={styles.imagePickerIcon}>
                  <Feather
                    name="image"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.imagePickerText}>
                  <Text style={styles.imagePickerTitle}>
                    Ajouter le flyer
                  </Text>

                  <Text style={styles.imagePickerHint}>
                    JPG, JPEG, PNG, WEBP ou GIF — 5 Mo
                    maximum
                  </Text>
                </View>

                <Feather
                  name="upload"
                  size={20}
                  color={theme.colors.primary}
                />
              </Pressable>
            ) : (
              <View style={styles.previewCard}>
                <Image
                  source={{
                    uri: selectedImage.uri,
                  }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />

                <View style={styles.previewInfo}>
                  <Text
                    style={styles.previewName}
                    numberOfLines={1}
                  >
                    {selectedImage.fileName ||
                      "Flyer de l’offre"}
                  </Text>

                  {!!selectedImage.fileSize && (
                    <Text style={styles.previewSize}>
                      {formatFileSize(
                        selectedImage.fileSize
                      )}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={styles.removeImageButton}
                  onPress={removeJobImage}
                >
                  <Feather
                    name="trash-2"
                    size={18}
                    color={theme.colors.danger}
                  />
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <SectionTitle title="Contenu de l’offre" />

            <LabeledInput
              label="Exigences — optionnel"
              value={form.requirements}
              onChangeText={(value) =>
                updateField("requirements", value)
              }
              placeholder="Compétences attendues, outils, expérience..."
              multiline
            />

            <LabeledInput
              label="Avantages — optionnel"
              value={form.benefits}
              onChangeText={(value) =>
                updateField("benefits", value)
              }
              placeholder="Primes, horaires flexibles, formation..."
              multiline
            />

            <LabeledInput
              label="Description"
              value={form.description}
              onChangeText={(value) =>
                updateField("description", value)
              }
              placeholder="Décris le poste, les missions et le profil recherché..."
              multiline
              error={errors.description}
            />
          </View>

          <Pressable
            style={[
              styles.submitBtn,
              (!canSubmit || loading) &&
                styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
          >
            <Feather
              name="send"
              size={17}
              color="#fff"
            />

            <Text style={styles.submitBtnText}>
              {loading
                ? "Publication..."
                : "Publier l’offre"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
  editable = true,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  editable?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
          !!error && styles.inputWrapError,
          !editable && styles.inputWrapDisabled,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          editable={editable}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled,
          ]}
          textAlignVertical={
            multiline ? "top" : "center"
          }
        />
      </View>

      {!!hint && (
        <Text style={styles.hint}>
          {hint}
        </Text>
      )}

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  flex: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 120,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },

  topBarCenter: {
    flex: 1,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  iconGhost: {
    width: 42,
    height: 42,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
  },

  pageSubTitle: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    fontWeight: "600",
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
    marginBottom: 14,
  },

  fieldBlock: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 8,
  },

  hint: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  inputWrap: {
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: "#fff",
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  inputWrapMultiline: {
    minHeight: 120,
    paddingVertical: 12,
  },

  inputWrapError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF7F7",
  },

  inputWrapDisabled: {
    backgroundColor: "#F1F5F9",
    opacity: 0.72,
  },

  input: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
    minHeight: 24,
    paddingVertical: 0,
  },

  inputMultiline: {
    minHeight: 92,
  },

  inputDisabled: {
    color: "#94A3B8",
  },

  errorText: {
    marginTop: 6,
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7E3F4",
    backgroundColor: "#FFFFFF",
  },

  chipActive: {
    backgroundColor: "#E8F1FF",
    borderColor: theme.colors.primary,
  },

  chipText: {
    color: "#475569",
    fontWeight: "800",
    fontSize: 12.5,
  },

  chipTextActive: {
    color: theme.colors.primary,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },

  switchText: {
    flex: 1,
  },

  imagePicker: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#93B7EE",
    backgroundColor: "#F5F9FF",
  },

  imagePickerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F1FF",
  },

  imagePickerText: {
    flex: 1,
  },

  imagePickerTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  imagePickerHint: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  previewCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: "#F8FAFC",
  },

  previewImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#E2E8F0",
  },

  previewInfo: {
    padding: 14,
    paddingRight: 58,
  },

  previewName: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 13.5,
  },

  previewSize: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  removeImageButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  submitBtn: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
  },

  submitBtnDisabled: {
    opacity: 0.6,
  },

  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});