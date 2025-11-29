import { StyleSheet } from 'react-native';

const shadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 4,
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F7' },
  header: {
    backgroundColor: '#007FFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIconImage: { width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 18,
    ...shadow,
  },
  heroLogo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#070D0D', marginBottom: 4 },
  heroSubtitle: { fontSize: 16, color: '#6B7280' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...shadow,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#070D0D', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  sectionIcon: { fontSize: 18, marginRight: 10, color: '#070D0D' },
  sectionText: { fontSize: 15, color: '#2B2F36', lineHeight: 21, flex: 1 },
  footerInfo: { alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: 13, color: '#9CA3AF', marginBottom: 2 },
  primaryButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#007FFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});



