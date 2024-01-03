function loadConfiguration(conf) {
	switch (conf) {
		case 'ceph':
			confHash = {
				sophia:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/ceph/volumes_node010.pub.prod.caas.s1.p.fti.net.csv",
				bagnolet:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/ceph/volumes_node010.pub.prod.caas.b2.p.fti.net.csv",
				montsouris:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/ceph/volumes_node010.pub.prod.caas.m1.p.fti.net.csv"
			}		
			break;
		case 'cluster':
			confHash = {
				recPrivSph: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/rec-priv-sph.csv",
				recPubSph: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/rec-pub-sph.csv",
				prodPrivSph: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-priv-sph.csv",
				prodPubSph: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-pub-sph.csv",
				prodPrivBgl: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-priv-bgl.csv",
				prodPubBgl: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-pub-bgl.csv",
				prodPrivMts: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-priv-mts.csv",
				prodPubMts: "https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/clusters/prod-pub-mts.csv"	
			}		
			break;
		case 'containers':
			confHash = {
				caniculelist:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/containers/canicule-container-list.csv",
				allreclist:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/containers/all-rec-container-list.csv",
				sphcontainerslist:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/containers/sph-container-list.csv",
				bglcontainerslist:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/containers/bgl-container-list.csv",
				mtscontainerslist:"https://picaasso.pages.gitlab.si.francetelecom.fr/clusters-status/containers/mts-container-list.csv"
			}		
			break;
		case 'vxlan':
			confHash = {
				ipused: "https://vdc.pages.gitlab.si.francetelecom.fr/docker-vxlan-checker/data.csv",
				vxlaninfo: "https://vdc.pages.gitlab.si.francetelecom.fr/docker-vxlan-checker/data2.csv",
				swarmservices: "https://vdc.pages.gitlab.si.francetelecom.fr/deploy-vxlan/vxlans_swarmservices_infos.csv"
			}
			break;
		default:
			confHash = {}
	}
	return confHash
}

