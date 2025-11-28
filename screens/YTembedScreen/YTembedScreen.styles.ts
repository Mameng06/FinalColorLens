import { StyleSheet, Dimensions } from 'react-native';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#007FFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3A86FF',
    fontWeight: '500',
    marginLeft: 8,
    alignSelf: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backIconImage: { width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  videoContainer: {
    height: height * 0.4,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  webView: {
    flex: 1,
  },
  webViewFallback: { justifyContent: 'center', alignItems: 'center' },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});